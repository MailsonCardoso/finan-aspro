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
            {/* Printable Area */}
            {selectedEmployee && (
                <div className="print-only text-black bg-white font-serif text-[11pt] leading-tight">

                    {/* PAGE 1: GUIA DE ENTREGA */}
                    <div className="print-page p-12 h-[210mm]">
                        <div className="text-center font-bold mb-6 uppercase border-b-2 border-black pb-4 text-[14pt]">
                            GUIA DE ENTREGA E CONTROLE DE EPI
                            <p className="text-[9pt] font-normal mt-1 normal-case italic">
                                (Documento de registro de entrega física do equipamento)
                            </p>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4">
                            <div className="border border-black p-3">
                                <p className="text-[8pt] uppercase font-bold text-gray-600">Empresa / Empregador</p>
                                <p className="font-bold">{settings?.company_name || "( NOME DA EMPRESA )"}</p>
                                <p className="text-[9pt]">CNPJ: {settings?.company_cnpj || "( CNPJ DA EMPRESA )"}</p>
                            </div>
                            <div className="border border-black p-3">
                                <p className="text-[8pt] uppercase font-bold text-gray-600">Colaborador / Recebedor</p>
                                <p className="font-bold">{selectedEmployee.name}</p>
                                <p className="text-[9pt]">Cargo: {selectedEmployee.role}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h4 className="font-bold mb-2 uppercase text-center border-x border-t border-black bg-gray-100 p-2 text-[10pt]">RELAÇÃO DE EQUIPAMENTOS ENTREGUES</h4>
                            <table className="w-full border-collapse border border-black text-[10pt]">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-black p-2 text-left">Equipamento de Proteção Individual (EPI)</th>
                                        <th className="border border-black p-2 text-center w-32">Nº CA</th>
                                        <th className="border border-black p-2 text-center w-40">Data de Entrega</th>
                                        <th className="border border-black p-2 text-center w-32">Qtd</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments && assignments.length > 0 ? (
                                        assignments.map((a: any) => (
                                            <tr key={a.id}>
                                                <td className="border border-black p-2">{a.epi?.name}</td>
                                                <td className="border border-black p-2 text-center font-mono">{a.epi?.ca_number || "-"}</td>
                                                <td className="border border-black p-2 text-center">{formatDate(a.assignment_date)}</td>
                                                <td className="border border-black p-2 text-center">01</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="border border-black p-4 text-center italic text-gray-400">Nenhum EPI registrado no mês vigente.</td>
                                        </tr>
                                    )}
                                    {/* Espaços vazios para preenchimento se necessário */}
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
                        </div>

                        <p className="mb-8 text-justify text-[10pt]">
                            Confirmo que recebi os equipamentos acima listados, em perfeitas condições de uso e higienização, estando devidamente treinado quanto ao uso correto, guarda e conservação, conforme determina a Norma Regulamentadora NR-06.
                        </p>

                        <div className="mt-12 grid grid-cols-2 gap-12">
                            <div className="text-center pt-8">
                                <div className="border-t border-black mb-1"></div>
                                <p className="text-[9pt]">Assinatura do Responsável (Entrega)</p>
                            </div>
                            <div className="text-center pt-8">
                                <div className="border-t border-black mb-1"></div>
                                <p className="text-[9pt]">Assinatura do Colaborador (Recebimento)</p>
                                <p className="text-[8pt] font-bold mt-1">{selectedEmployee.name}</p>
                            </div>
                        </div>

                        <div className="mt-8 text-right text-[9pt]">
                            {settings?.company_address?.split(',')[0] || "Local"}, {now.getDate()} de {meses[now.getMonth()]} de {now.getFullYear()}
                        </div>
                    </div>

                    {/* PAGE BREAK FOR PRINT */}
                    <div className="page-break"></div>

                    {/* PAGE 2: FICHA DE CONTROLE (TERMO LEGAL) */}
                    <div className="print-page p-12 h-[210mm]">
                        <div className="text-center font-bold mb-6 uppercase border-b-2 border-black pb-4 text-[14pt]">
                            FICHA DE CONTROLE DE EPI - TERMO DE RESPONSABILIDADE
                        </div>

                        <div className="mb-6">
                            <p className="font-bold border-b border-black pb-1">Nome do Colaborador: {selectedEmployee.name}</p>
                        </div>

                        <div className="text-[9.5pt] space-y-3 text-justify leading-snug">
                            <p>
                                Declaro para todos efeitos legais que recebi da empresa <strong>{settings?.company_name || "( NOME DA EMPRESA )"}</strong>,
                                CNPJ: <strong>{settings?.company_cnpj || "( CNPJ DA EMPRESA )"}</strong>, os Equipamentos de Proteção Individual constantes da guia em anexo,
                                novos e em perfeitas condições de uso, e que estou ciente das obrigações descritas na NR 06, baixada pela Portaria MTb 3214/78, subitem 6.7.1, a saber:
                            </p>
                            <div className="pl-6 space-y-1">
                                <p>a) usar, utilizando-o apenas para a finalidade a que se destina;</p>
                                <p>b) responsabilizar-se pela guarda e conservação;</p>
                                <p>c) comunicar ao empregador qualquer alteração que o torne impróprio para uso; e</p>
                                <p>d) cumprir as determinações do empregador sobre o uso adequado.</p>
                                <p>e) Fico proibido de dar ou emprestar o equipamento que estiver sob minha responsabilidade, só podendo fazê-lo se receber ordem por escrito da pessoa autorizada para tal fim.</p>
                            </div>
                            <p>
                                Declaro, também, que estou ciente das disposições do Art. 462 e § 1º da CLT, e autorizo o desconto salarial proporcional ao custo de reparação do dano que os EPIs aos meus cuidados venham apresentar.
                                Declaro ainda que estou ciente das disposições do artigo 158, alínea “a”, da CLT, e do item 1.8 da NR 01, em especial daquela do subitem 1.8.1, de que constitui ato faltoso à recusa injustificada de usar EPI fornecido pela empresa, incorrendo nas penas da Lei cabíveis que irão desde simples advertências até a dispensa por justa causa (Art. 482 da C.L.T).
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-4 text-[7.5pt] text-gray-700 leading-tight">
                            <div className="border p-3 rounded bg-gray-50">
                                <p className="font-bold mb-1 border-b border-gray-300 pb-1 uppercase">NR 06 - Cabe ao empregado:</p>
                                <p>6.7.1. Cabe ao empregado quanto ao EPI: a) usar, utilizando-o apenas para a finalidade a que se destina; b) responsabilizar-se pela guarda e conservação; c) comunicar ao empregador qualquer alteração que o torne impróprio para uso; e, d) cumprir as determinações do empregador sobre o uso adequado.</p>
                                <p className="mt-2 font-bold mb-1 border-b border-gray-300 pb-1 uppercase">CLT Art. 462:</p>
                                <p>§ 1º - Em caso de dano causado pelo empregado, o desconto será lícito, desde que esta possibilidade tenha sido acordada ou na ocorrência de dolo do empregado.</p>
                            </div>
                            <div className="border p-3 rounded bg-gray-50">
                                <p className="font-bold mb-1 border-b border-gray-300 pb-1 uppercase">NR 01 - Cabe ao empregado:</p>
                                <p>a) cumprir as disposições legais e regulamentares sobre segurança e medicina do trabalho, inclusive as ordens de serviço expedidas pelo empregador; b) usar o EPI fornecido pelo empregador; c) submeter-se aos exames médicos previstos nas Normas Regulamentadoras - NR; d) colaborar com a empresa na aplicação das Normas Regulamentadoras – NR.</p>
                                <p className="mt-1 font-bold">1.8.1. Constitui ato faltoso a recusa injustificada do empregado ao cumprimento do disposto no item anterior.</p>
                            </div>
                        </div>

                        <div className="mt-16 flex flex-col items-center">
                            <div className="w-1/2 border-t border-black"></div>
                            <p className="mt-2 font-bold mb-6 italic text-[10pt]">(Assinatura do Colaborador)</p>
                            <p className="text-[12pt] font-bold">{selectedEmployee.name}</p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .page-break { page-break-after: always; height: 0; display: block; border: none; }
          .print-page { 
            width: 297mm; 
            height: 210mm; 
            overflow: hidden;
            box-sizing: border-box;
          }
          body { 
            margin: 0; 
            padding: 0; 
            background: white !important; 
          }
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
        }
        .print-only { display: none; }
      `}</style>
        </SidePanel>
    );
}
