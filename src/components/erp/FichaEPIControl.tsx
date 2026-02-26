import { useState } from "react";
import { FileText, Printer, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatDate } from "@/lib/format";
import { SidePanel } from "./SidePanel";

export function FichaEPIControl({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: employees } = useQuery({
        queryKey: ["employees"],
        queryFn: async () => {
            const response = await api.get("/employees");
            return response.data;
        },
        enabled: open,
    });

    const { data: settings } = useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const response = await api.get("/settings");
            return response.data;
        },
        enabled: open,
    });

    const { data: assignments, refetch: fetchAssignments, isFetching: loadingAssignments } = useQuery({
        queryKey: ["epi-assignments-current-month", selectedEmployeeId],
        queryFn: async () => {
            const response = await api.get("/epis/assignments");
            const all = response.data;

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            return all.filter((a: any) => {
                if (a.employee_id.toString() !== selectedEmployeeId) return false;
                if (a.status !== 'delivered') return false;

                const assignDate = new Date(a.assignment_date);
                return assignDate.getMonth() === currentMonth && assignDate.getFullYear() === currentYear;
            });
        },
        enabled: !!selectedEmployeeId && open,
    });

    const handlePrint = () => {
        window.print();
    };

    const selectedEmployee = employees?.find((e: any) => e.id.toString() === selectedEmployeeId);
    const now = new Date();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <SidePanel open={open} onOpenChange={onOpenChange} title="Ficha de Controle de EPI">
            <div className="space-y-6 pb-20 no-print">
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                    <label className="block text-sm font-medium text-foreground mb-1">Selecione o Funcionário</label>
                    <select
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="">Selecione...</option>
                        {employees?.map((e: any) => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                        * A ficha trará apenas EPIs ativos entregues no mês vigente ({meses[now.getMonth()]}/{now.getFullYear()}).
                    </p>
                </div>

                {selectedEmployeeId && (
                    <div className="flex justify-end">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm font-bold shadow-md"
                        >
                            <Printer className="h-4 w-4" /> Imprimir Ficha
                        </button>
                    </div>
                )}

                {selectedEmployeeId && assignments?.length === 0 && !loadingAssignments && (
                    <div className="p-8 text-center border-2 border-dashed rounded-xl">
                        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Nenhum EPI ativo encontrado para este funcionário no mês vigente.</p>
                    </div>
                )}
            </div>

            {/* Printable Area */}
            {selectedEmployee && (
                <div className="print-only text-black bg-white font-serif text-[11pt] leading-tight">

                    {/* SINGLE UNIFIED PAGE */}
                    <div className="print-page p-4 flex flex-col justify-between" style={{ height: '100%', maxHeight: '100vh', boxSizing: 'border-box' }}>
                        <div>
                            <div className="text-center font-bold mb-2 uppercase border-b-2 border-black pb-1 text-[12pt]">
                                FICHA DE CONTROLE E TERMO DE RESPONSABILIDADE DE EPI
                            </div>

                            <div className="mb-2 grid grid-cols-2 gap-4">
                                <div className="border border-black p-1.5 leading-tight">
                                    <p className="text-[6.5pt] uppercase font-bold text-gray-600">Empresa / Empregador</p>
                                    <p className="font-bold text-[9pt]">{settings?.company_name || "( NOME DA EMPRESA )"}</p>
                                    <p className="text-[7.5pt]">CNPJ: {settings?.company_cnpj || "( CNPJ DA EMPRESA )"}</p>
                                </div>
                                <div className="border border-black p-1.5 leading-tight">
                                    <p className="text-[6.5pt] uppercase font-bold text-gray-600">Colaborador / Recebedor</p>
                                    <p className="font-bold text-[9pt]">{selectedEmployee.name}</p>
                                    <p className="text-[7.5pt]">Cargo: {selectedEmployee.role}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 flex-1 overflow-hidden">
                            {/* Left Side: Table */}
                            <div className="w-[55%] flex flex-col">
                                <h4 className="font-bold mb-0.5 uppercase text-center border-x border-t border-black bg-gray-100 p-0.5 text-[8pt]">RELAÇÃO DE EQUIPAMENTOS ENTREGUES</h4>
                                <table className="w-full border-collapse border border-black text-[7pt]">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-black p-1 text-left">EPI</th>
                                            <th className="border border-black p-1 text-center w-20">Nº CA</th>
                                            <th className="border border-black p-1 text-center w-20">Data Entrega</th>
                                            <th className="border border-black p-1 text-center w-10">Qtd</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignments && assignments.length > 0 ? (
                                            assignments.map((a: any) => (
                                                <tr key={a.id}>
                                                    <td className="border border-black p-1">{a.epi?.name}</td>
                                                    <td className="border border-black p-1 text-center font-mono text-[6.5pt] truncate max-w-[80px]">{a.epi?.description || "-"}</td>
                                                    <td className="border border-black p-1 text-center">{formatDate(a.assignment_date)}</td>
                                                    <td className="border border-black p-1 text-center">01</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="border border-black p-1.5 text-center italic text-gray-400">Nenhum EPI registrado no mês vigente.</td>
                                            </tr>
                                        )}
                                        {/* Reduced Empty rows to save space */}
                                        {[...Array(Math.max(0, 5 - (assignments?.length || 0)))].map((_, i) => (
                                            <tr key={`empty-${i}`}>
                                                <td className="border border-black p-3">&nbsp;</td>
                                                <td className="border border-black p-3">&nbsp;</td>
                                                <td className="border border-black p-3">&nbsp;</td>
                                                <td className="border border-black p-3">&nbsp;</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="mt-2 text-[7.5pt] text-justify leading-snug">
                                    <p className="mb-1">
                                        Declaro para todos efeitos legais que recebi da empresa <strong>{settings?.company_name || "( NOME DA EMPRESA )"}</strong> os Equipamentos de Proteção Individual constantes na tabela acima, novos e em perfeitas condições de uso.
                                    </p>
                                    <p>
                                        Estou ciente das disposições do Art. 462 e § 1º da CLT, e autorizo o desconto salarial proporcional ao custo de reparação do dano que os EPIs aos meus cuidados venham apresentar. Fico proibido de dar ou emprestar o EPI que estiver sob minha responsabilidade.
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Terms and Norms */}
                            <div className="w-[45%] flex flex-col text-[7.5pt] leading-[1.15] space-y-1.5">
                                <div>
                                    <p className="font-bold text-[8pt] border-b border-black pb-0.5 mb-1 uppercase">Termo de Responsabilidade</p>
                                </div>

                                <div>
                                    <p className="font-bold">NR 06</p>
                                    <p className="font-medium">6.7. Cabe ao empregado:</p>
                                    <p className="font-medium">6.7.1. Cabe ao empregado quanto ao EPI:</p>
                                    <p>a) usar, utilizando-o apenas para a finalidade a que se destina;</p>
                                    <p>b) responsabilizar-se pela guarda e conservação;</p>
                                    <p>c) comunicar ao empregador qualquer alteração que o torne impróprio para uso; e,</p>
                                    <p>d) cumprir as determinações do empregador sobre o uso adequado.</p>
                                </div>

                                <div>
                                    <p className="font-bold">NR 01</p>
                                    <p className="font-medium">1.8. Cabe ao empregado:</p>
                                    <p>a) cumprir as disposições legais e regulamentares sobre segurança e medicina do trabalho, inclusive as ordens de serviço expedidas pelo empregador;</p>
                                    <p>b) usar o EPI fornecido pelo empregador;</p>
                                    <p>c) submeter-se aos exames médicos previstos nas Normas Regulamentadoras - NR;</p>
                                    <p>d) colaborar com a empresa na aplicação das Normas Regulamentadoras – NR.</p>
                                    <p className="font-medium mt-0.5">1.8.1. Constitui ato faltoso a recusa injustificada do empregado ao cumprimento do disposto no item anterior.</p>
                                </div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="mt-4 shrink-0">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="text-center pt-6">
                                    <div className="border-t border-black mb-1"></div>
                                    <p className="text-[8pt]">Assinatura do Responsável (Entrega)</p>
                                </div>
                                <div className="text-center pt-6">
                                    <div className="border-t border-black mb-1"></div>
                                    <p className="text-[8pt] font-semibold">Assinatura do Colaborador: {selectedEmployee.name}</p>
                                </div>
                            </div>
                            <div className="text-right text-[8pt] mt-2 text-gray-700">
                                {settings?.company_address?.split(',')[0] || "Local"}, {now.getDate()} de {meses[now.getMonth()]} de {now.getFullYear()}
                            </div>
                        </div>
                    </div>

                    <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
          
          body, html { 
            margin: 0 !important; 
            padding: 0 !important; 
            background: white !important; 
          }
          
          body * { 
            visibility: hidden; 
          }

          /* Remove transforms que podem 'prender' o position: fixed dentro do SidePanel */
          div {
            transform: none !important;
          }
          
          .print-only, .print-only * { 
            visibility: visible; 
          }
          
          .print-only { 
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 290mm !important;
            margin: 0;
            padding: 0;
            z-index: 999999 !important;
          }
          
          .page-break { 
            page-break-after: always;
            height: 0;
            display: block;
            border: none;
          }
          
          .print-page { 
            width: 100%;
            box-sizing: border-box;
            background: white;
            padding: 10mm;
          }
          
          .no-print { display: none !important; }
        }
        
        @media screen {
          .print-only { display: none; }
        }
      `}</style>
                </div>
            )}
        </SidePanel>
    );
}
