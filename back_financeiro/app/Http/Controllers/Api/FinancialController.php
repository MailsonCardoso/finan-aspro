<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FinancialController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');
        $month = $request->query('month');
        $year = $request->query('year');
        $status = $request->query('status');

        $query = FinancialEntry::query();

        if ($status) {
            $query->where('status', $status);
        }

        if ($type) {
            $query->where('type', $type);
        }

        if ($month) {
            $query->whereMonth('due_date', $month);
        }

        if ($year) {
            $query->whereYear('due_date', $year);
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
            'expense_type' => 'nullable|in:fixa,variavel,imposto',
            'category' => 'nullable|string',
            'status' => 'nullable|in:pending,paid,cancelled',
            'client_id' => 'nullable|exists:clients,id',
            'expense_id' => 'nullable|exists:expenses,id',
            'bank_account' => 'nullable|string',
            'payment_method' => 'nullable|string',
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

    public function dashboardStats(Request $request)
    {
        $selectedYear = $request->query('year', date('Y'));
        $selectedMonth = $request->query('month', date('m'));

        $lastMonth = date('m', strtotime("$selectedYear-$selectedMonth-01 -1 month"));
        $lastYear = date('Y', strtotime("$selectedYear-$selectedMonth-01 -1 month"));

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

        $current = $getStats($selectedMonth, $selectedYear);
        $previous = $getStats($lastMonth, $lastYear);

        $calculateTrend = function ($cur, $prev) {
            if ($prev == 0)
                return $cur > 0 ? 100 : 0;
            return round((($cur - $prev) / abs($prev)) * 100, 1);
        };

        // Chart: Cash Flow Data (Total Year: Jan to Dec)
        $cashFlowData = collect(range(1, 12))->map(function ($monthNum) use ($selectedYear) {
            $month = str_pad($monthNum, 2, '0', STR_PAD_LEFT);
            $year = $selectedYear;

            $months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            $monthName = $months[$monthNum - 1];

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

        // Chart: Cost Structure (Pie Chart) - Selected Month
        $costStructureRaw = FinancialEntry::where('type', 'expense')
            ->whereYear('due_date', $selectedYear)
            ->whereMonth('due_date', $selectedMonth)
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

        $impostos = $entries->where('type', 'expense')
            ->where('expense_type', 'imposto')
            ->sum('value');

        $receitaLiquida = $receitaBruta - $impostos;

        $custosVariaveis = $entries->where('type', 'expense')
            ->where('expense_type', 'variavel')
            ->sum('value');

        $margemContribuicao = $receitaLiquida - $custosVariaveis;

        $despesasOperacionais = $entries->where('type', 'expense')
            ->where('expense_type', 'fixa')
            ->sum('value');

        $lucroLiquido = $margemContribuicao - $despesasOperacionais;

        return response()->json([
            'periodo' => "$month/$year",
            'receita_bruta' => (float) $receitaBruta,
            'impostos' => (float) $impostos,
            'receita_liquida' => (float) $receitaLiquida,
            'custos_variaveis' => (float) $custosVariaveis,
            'margem_contribuicao' => (float) $margemContribuicao,
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

    public function analysis(Request $request)
    {
        $year = $request->query('year', date('Y'));
        $month = $request->query('month', date('m'));

        // Data limite: último dia do mês anterior
        $lastDayOfPrevMonth = date('Y-m-d', strtotime("$year-$month-01 -1 day"));

        // Saldo Acumulado até o mês anterior
        $prevBalance = FinancialEntry::where('due_date', '<=', $lastDayOfPrevMonth)
            ->where('status', 'paid')
            ->selectRaw("SUM(CASE WHEN type = 'income' THEN value ELSE -value END) as total")
            ->first()->total ?: 0;

        $query = FinancialEntry::whereYear('due_date', $year)
            ->whereMonth('due_date', $month)
            ->where('status', 'paid');

        $entries = $query->get();

        // Agrupamento por Conta Bancária
        $byAccount = $entries->groupBy('bank_account')->map(function ($group, $account) {
            $income = $group->where('type', 'income')->sum('value');
            $expense = $group->where('type', 'expense')->sum('value');
            return [
                'account' => $account ?: 'Não Definida',
                'income' => (float) $income,
                'expense' => (float) $expense,
                'balance' => (float) ($income - $expense)
            ];
        })->values();

        // Agrupamento por Forma de Pagamento
        $byMethod = $entries->groupBy('payment_method')->map(function ($group, $method) {
            $income = $group->where('type', 'income')->sum('value');
            $expense = $group->where('type', 'expense')->sum('value');
            return [
                'method' => $method ?: 'Não Definida',
                'income' => (float) $income,
                'expense' => (float) $expense,
                'total' => (float) ($income + $expense),
                'count' => $group->count()
            ];
        })->values();

        $currentIncome = (float) $entries->where('type', 'income')->sum('value');
        $currentExpense = (float) $entries->where('type', 'expense')->sum('value');

        return response()->json([
            'periodo' => "$month/$year",
            'prev_balance' => (float) $prevBalance,
            'by_account' => $byAccount,
            'by_method' => $byMethod,
            'total_month' => [
                'income' => $currentIncome,
                'expense' => $currentExpense,
                'net_balance' => (float) ($currentIncome - $currentExpense),
            ]
        ]);
    }

    public function wipe()
    {
        Schema::disableForeignKeyConstraints();

        $tables = [
            'financial_entries',
            'epi_assignments',
            'epis',
            'employees',
            'clients',
            'expenses'
        ];

        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }

        Schema::enableForeignKeyConstraints();

        return response()->json(['message' => 'Sistema limpo com sucesso!']);
    }
}
