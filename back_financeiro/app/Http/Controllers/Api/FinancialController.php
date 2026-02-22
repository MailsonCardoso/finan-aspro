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
            'type' => 'required|in:income,expense',
            'category' => 'nullable|string',
            'status' => 'nullable|in:pending,paid,cancelled',
        ]);

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
        $saldo = FinancialEntry::where('status', 'paid')
            ->selectRaw("SUM(CASE WHEN type = 'income' THEN value ELSE -value END) as total")
            ->value('total') ?? 0;

        $aReceber = FinancialEntry::where('type', 'income')
            ->where('status', 'pending')
            ->sum('value');

        $aPagar = FinancialEntry::where('type', 'expense')
            ->where('status', 'pending')
            ->sum('value');

        // Lucro Líquido (simplificado: Receitas Pagas - Despesas Pagas no mês atual ou total)
        $lucroLiquido = FinancialEntry::where('status', 'paid')
            ->selectRaw("SUM(CASE WHEN type = 'income' THEN value ELSE -value END) as total")
            ->value('total') ?? 0;

        return response()->json([
            'saldo_caixa' => (float) $saldo,
            'a_receber' => (float) $aReceber,
            'a_pagar' => (float) $aPagar,
            'lucro_liquido' => (float) $lucroLiquido,
        ]);
    }

    public function dre(Request $request)
    {
        $year = $request->query('year', date('Y'));
        $month = $request->query('month', date('m'));

        $query = FinancialEntry::whereYear('due_date', $year)
            ->whereMonth('due_date', $month)
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
