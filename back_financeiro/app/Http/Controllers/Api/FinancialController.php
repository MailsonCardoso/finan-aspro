<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinancialController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type'); // 'income' or 'expense'
        $query = FinancialEntry::query();

        if ($type) {
            $query->where('type', $type);
        }

        return $query->orderBy('due_date', 'desc')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => 'required|string',
            'value' => 'required|numeric',
            'due_date' => 'required|date',
            'issue_date' => 'nullable|date',
            'type' => 'required|in:income,expense',
            'category' => 'nullable|string',
            'status' => 'nullable|in:pending,paid,cancelled',
        ]);

        if (empty($data['issue_date'])) {
            $data['issue_date'] = $data['due_date'];
        }

        return FinancialEntry::create($data);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,cancelled',
        ]);

        $entry = FinancialEntry::findOrFail($id);
        $entry->update(['status' => $request->status]);

        return $entry;
    }

    public function dashboardStats()
    {
        $currentMonth = date('m');
        $currentYear = date('Y');
        $lastMonth = date('m', strtotime('-1 month'));
        $lastYear = date('Y', strtotime('-1 month'));

        $getStats = function ($m, $y) {
            $saldo = FinancialEntry::where('status', 'paid')
                ->whereYear('due_date', $y)
                ->whereMonth('due_date', $m)
                ->selectRaw("SUM(CASE WHEN type = 'income' THEN value ELSE -value END) as total")
                ->value('total') ?? 0;

            $aReceber = FinancialEntry::where('type', 'income')
                ->where('status', 'pending')
                ->whereYear('due_date', $y)
                ->whereMonth('due_date', $m)
                ->sum('value');

            $aPagar = FinancialEntry::where('type', 'expense')
                ->where('status', 'pending')
                ->whereYear('due_date', $y)
                ->whereMonth('due_date', $m)
                ->sum('value');

            $lucroLiquido = FinancialEntry::where('status', 'paid')
                ->whereYear('due_date', $y)
                ->whereMonth('due_date', $m)
                ->selectRaw("SUM(CASE WHEN type = 'income' THEN value ELSE -value END) as total")
                ->value('total') ?? 0;

            return compact('saldo', 'aReceber', 'aPagar', 'lucroLiquido');
        };

        $current = $getStats($currentMonth, $currentYear);
        $previous = $getStats($lastMonth, $lastYear);

        $calculateTrend = function ($cur, $prev) {
            if ($prev == 0)
                return $cur > 0 ? 100 : 0;
            return round((($cur - $prev) / abs($prev)) * 100, 1);
        };

        // Chart: Cash Flow Data (last 6 months)
        $cashFlowData = collect(range(5, 0))->map(function ($i) {
            $month = date('m', strtotime("-$i month"));
            $year = date('Y', strtotime("-$i month"));

            // Map month number to pt-BR abbr
            $months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            $monthName = $months[intval($month) - 1];

            $receitas = FinancialEntry::where('type', 'income')
                ->where('status', 'paid')
                ->whereYear('due_date', $year)
                ->whereMonth('due_date', $month)
                ->sum('value');

            $despesas = FinancialEntry::where('type', 'expense')
                ->where('status', 'paid')
                ->whereYear('due_date', $year)
                ->whereMonth('due_date', $month)
                ->sum('value');

            return [
                'month' => $monthName,
                'Receitas' => (float) $receitas,
                'Despesas' => (float) $despesas,
            ];
        })->values();

        // Chart: Cost Structure (Pie Chart) - Current Month
        $costStructureRaw = FinancialEntry::where('type', 'expense')
            ->whereYear('due_date', $currentYear)
            ->whereMonth('due_date', $currentMonth)
            ->selectRaw('category, SUM(value) as total')
            ->groupBy('category')
            ->get();

        $costStructure = $costStructureRaw->map(function ($item) {
            return [
                'name' => $item->category ?: 'Outros',
                'value' => (float) $item->total,
            ];
        });

        if ($costStructure->isEmpty()) {
            $costStructure = collect([['name' => 'Sem Despesas', 'value' => 1]]);
        }

        return response()->json([
            'saldo_caixa' => (float) $current['saldo'],
            'saldo_caixa_trend' => $calculateTrend($current['saldo'], $previous['saldo']),
            'a_receber' => (float) $current['aReceber'],
            'a_receber_trend' => $calculateTrend($current['aReceber'], $previous['aReceber']),
            'a_pagar' => (float) $current['aPagar'],
            'a_pagar_trend' => $calculateTrend($current['aPagar'], $previous['aPagar']),
            'lucro_liquido' => (float) $current['lucroLiquido'],
            'lucro_liquido_trend' => $calculateTrend($current['lucroLiquido'], $previous['lucroLiquido']),
            'cash_flow_data' => $cashFlowData,
            'cost_structure' => $costStructure,
        ]);
    }

    public function dre(Request $request)
    {
        $year = $request->query('year', date('Y'));
        $month = $request->query('month', date('m'));

        $query = FinancialEntry::whereYear('issue_date', $year)
            ->whereMonth('issue_date', $month)
            ->where('status', '!=', 'cancelled');

        $entries = $query->get();

        $receitaBruta = $entries->where('type', 'income')->sum('value');

        $custosVariaveis = $entries->where('type', 'expense')
            ->whereIn('category', ['Fornecedores', 'Impostos'])
            ->sum('value');

        $despesasOperacionais = $entries->where('type', 'expense')
            ->whereNotIn('category', ['Fornecedores', 'Impostos'])
            ->sum('value');

        $lucroBruto = $receitaBruta - $custosVariaveis;
        $lucroLiquido = $lucroBruto - $despesasOperacionais;

        return response()->json([
            'periodo' => "$month/$year",
            'receita_bruta' => (float) $receitaBruta,
            'custos_variaveis' => (float) $custosVariaveis,
            'lucro_bruto' => (float) $lucroBruto,
            'despesas_operacionais' => (float) $despesasOperacionais,
            'lucro_liquido' => (float) $lucroLiquido,
            'detalhes' => [
                'por_categoria' => $entries->groupBy('category')->map(function ($group) {
                    return [
                        'type' => $group->first()->type,
                        'total' => $group->sum('value')
                    ];
                })
            ]
        ]);
    }
}
