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
  const meses = ["Janeiro", "Fevereiro", "Mar├ºo", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <SidePanel open={open} onOpenChange={onOpenChange} title="Ficha de Controle de EPI">
      <div className="space-y-6 pb-20 no-print">
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
          <label className="block text-sm font-medium text-foreground mb-1">Selecione o Funcion├írio</label>
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
            * A ficha trar├í apenas EPIs ativos entregues no m├¬s vigente ({meses[now.getMonth()]}/{now.getFullYear()}).
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
            <p className="text-sm text-muted-foreground">Nenhum EPI ativo encontrado para este funcion├írio no m├¬s vigente.</p>
          </div>
        )}
      </div>

      {/* Printable Area */}
      {selectedEmployee && (
        <div className="print-only p-8 text-black bg-white font-serif text-[12pt] leading-relaxed">
          <div className="text-center font-bold mb-8 uppercase border-b-2 border-black pb-4">
            FICHA DE CONTROLE DE ENTREGA DE EPI
            <p className="text-[9pt] font-normal mt-1 normal-case italic">
              (Com base em disposi├º├Áes legais da CLT e das Normas Regulamentadoras NR 01 e NR 06, do Minist├®rio do Trabalho e Emprego)
            </p>
          </div>

          <div className="mb-6">
            <p className="mb-4">O objetivo desta Guia ├® servir de meio de entrega e controle dos Equipamentos de Prote├º├úo Individual (EPIs) que ficar├úo aos cuidados do Colaborador abaixo identificado.</p>
            <p className="font-bold border-b border-black pb-1">Nome do Colaborador: {selectedEmployee.name}</p>
          </div>

          <p className="mb-6 text-[10pt]">O n├║mero do Certificado de Aprova├º├úo (CA) encontra-se impresso em caracteres indel├®veis e bem vis├¡veis no EPI e dever├í ser verificado e confirmado atrav├®s de rubrica do respons├ível pela entrega.</p>

          <div className="mb-6">
            <h4 className="font-bold mb-2 uppercase text-center border bg-gray-100 p-2">EPIs ENTREGUES NO PER├ìODO</h4>
            <table className="w-full border-collapse border border-black text-[10pt]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black p-2 text-left">EPI</th>
                  <th className="border border-black p-2 text-left">CA</th>
                  <th className="border border-black p-2 text-center">Data Entrega</th>
                  <th className="border border-black p-2 text-left">Funcion├írio</th>
                </tr>
              </thead>
              <tbody>
                {assignments?.map((a: any) => (
                  <tr key={a.id}>
                    <td className="border border-black p-2">{a.epi?.name}</td>
                    <td className="border border-black p-2">{a.epi?.ca_number || "-"}</td>
                    <td className="border border-black p-2 text-center">{formatDate(a.assignment_date)}</td>
                    <td className="border border-black p-2 whitespace-nowrap">{selectedEmployee.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[9pt] space-y-4 text-justify">
            <p>
              Declaro para todos efeitos legais que recebi da empresa <strong>{settings?.company_name || "( NOME DA EMPRESA )"}</strong>, 
              CNPJ: <strong>{settings?.company_cnpj || "( CNPJ DA EMPRESA )"}</strong>, os Equipamentos de Prote├º├úo Individual constantes da lista acima, 
              novos e em perfeitas condi├º├Áes de uso, e que estou ciente das obriga├º├Áes descritas na NR 06, baixada pela Portaria MTb 3214/78, subitem 6.7.1, a saber:
            </p>
            <p className="pl-4">
              a) usar, utilizando-o apenas para a finalidade a que se destina;<br />
              b) responsabilizar-se pela guarda e conserva├º├úo;<br />
              c) comunicar ao empregador qualquer altera├º├úo que o torne impr├│prio para uso; e<br />
              d) cumprir as determina├º├Áes do empregador sobre o uso adequado.<br />
              e) Fico proibido de dar ou emprestar o equipamento que estiver sob minha responsabilidade, s├│ podendo faz├¬-lo se receber ordem por escrito da pessoa autorizada para tal fim.
            </p>
            <p>
              Declaro, tamb├®m, que estou ciente das disposi├º├Áes do Art. 462 e ┬º 1┬║ da CLT, e autorizo o desconto salarial proporcional ao custo de repara├º├úo do dano que os EPIs aos meus cuidados venham apresentar.
              Declaro ainda que estou ciente das disposi├º├Áes do artigo 158, al├¡nea ÔÇ£aÔÇØ, da CLT, e do item 1.8 da NR 01, em especial daquela do subitem 1.8.1, de que constitui ato faltoso ├á recusa injustificada de usar EPI fornecido pela empresa, incorrendo nas penas da Lei cab├¡veis que ir├úo desde simples advert├¬ncias at├® a dispensa por justa causa (Art. 482 da C.L.T).
            </p>
          </div>

          <div className="mt-12 mb-16">
            <p className="text-right">{settings?.company_address?.split(',')[0] || "................................."}, {now.getDate()} de {meses[now.getMonth()]} de {now.getFullYear()}</p>
          </div>

          <div className="flex flex-col items-center mt-20">
            <div className="w-2/3 border-t border-black"></div>
            <p className="mt-2">(assinatura do Colaborador)</p>
          </div>

          <div className="mt-12 pt-4 border-t border-black text-[7pt] text-gray-600 grid grid-cols-2 gap-4 leading-tight">
            <div>
              <p><strong>NR 06 - 6.7. Cabe ao empregado:</strong></p>
              <p>6.7.1. Cabe ao empregado quanto ao EPI: a) usar, utilizando-o apenas para a finalidade a que se destina; b) responsabilizar-se pela guarda e conserva├º├úo; c) comunicar ao empregador qualquer altera├º├úo que o torne impr├│prio para uso; e, d) cumprir as determina├º├Áes do empregador sobre o uso adequado.</p>
              <p className="mt-2"><strong>CLT:</strong></p>
              <p>Art. 462, ┬º 1┬║ - Em caso de dano causado pelo empregado, o desconto ser├í l├¡cito, desde que esta possibilidade tenha sido acordada ou na ocorr├¬ncia de dolo do empregado.</p>
            </div>
            <div>
              <p><strong>NR 01 - 1.8. Cabe ao empregado:</strong></p>
              <p>a) cumprir as disposi├º├Áes legais e regulamentares sobre seguran├ºa e medicina do trabalho, inclusive as ordens de servi├ºo expedidas pelo empregador; b) usar o EPI fornecido pelo empregador; c) submeter-se aos exames m├®dicos previstos nas Normas Regulamentadoras - NR; d) colaborar com a empresa na aplica├º├úo das Normas Regulamentadoras ÔÇô NR.</p>
              <p>1.8.1. Constitui ato faltoso a recusa injustificada do empregado ao cumprimento do disposto no item anterior.</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 9999; }
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
        }
        .print-only { display: none; }
      `}</style>
    </SidePanel>
  );
}
