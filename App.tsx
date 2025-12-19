
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { UserAnswers, AIRecommendation, ProblemImpact } from './types';
import { getLegalInsight } from './services/geminiService';
import { jsPDF } from 'jspdf';

const INITIAL_ANSWERS: UserAnswers = {
  nombre: "",
  email: "",
  telefono: "",
  horario: "",
  tipoProblema: 'otros',
  detalle: "",
  impacto: [],
  accionesPrevias: "",
  urgencia: 'media',
  puedeDecidir: 'si'
};

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<UserAnswers>(INITIAL_ANSWERS);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);

  const totalSteps = 8;

  const handleChange = (field: keyof UserAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const toggleImpact = (val: ProblemImpact) => {
    const current = [...answers.impacto];
    const index = current.indexOf(val);
    if (index > -1) current.splice(index, 1);
    else current.push(val);
    handleChange('impacto', current);
  };

  const next = () => setStep(prev => Math.min(prev + 1, 9));
  const back = () => setStep(prev => Math.max(prev - 1, 1));
  const restart = () => {
    setStep(1);
    setAnswers(INITIAL_ANSWERS);
    setRecommendation(null);
  };

  const handleGenerateResult = async () => {
    setLoading(true);
    setStep(8);
    const result = await getLegalInsight(answers);
    setRecommendation(result);
    setLoading(false);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSending(false);
    setStep(9);
  };

  const downloadPDF = () => {
    if (!recommendation) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    
    // --- PÁGINA 1: IDENTIDAD Y ANÁLISIS DE RIESGOS ---
    doc.setFillColor(15, 23, 42); // Navy Dark Header
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Moreira & Fernández", margin, 22);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("INFORME ESTRATÉGICO DE VIABILIDAD JURÍDICA", margin, 28);
    doc.text(`REF: LP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, pageWidth - margin, 28, { align: 'right' });

    // Tarjeta Cliente
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 35, contentWidth, 20, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(`SOLICITANTE: ${answers.nombre.toUpperCase()}`, margin + 5, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`FECHA: ${new Date().toLocaleDateString()}`, pageWidth - margin - 5, 45, { align: 'right' });

    let y = 68;

    // 1. Valoración del Escenario
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("1. Valoración del Escenario", margin, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    const insightLines = doc.splitTextToSize(recommendation.insight, contentWidth);
    doc.text(insightLines, margin, y, { align: 'left', maxWidth: contentWidth });
    y += (insightLines.length * 5.8) + 12;

    // 2. Análisis de Riesgos Inminentes
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(185, 28, 28);
    doc.text("2. Análisis de Riesgos Inminentes", margin, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    const riskLines = doc.splitTextToSize(recommendation.riskAnalysis, contentWidth);
    doc.text(riskLines, margin, y, { align: 'left', maxWidth: contentWidth });
    y += (riskLines.length * 5.8) + 12;

    // Caja de Advertencia Crítica
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(252, 165, 165);
    const urgencyLines = doc.splitTextToSize(`ATENCIÓN: ${recommendation.urgencyWarning}`, contentWidth - 10);
    const boxUrgencyH = (urgencyLines.length * 5) + 10;
    doc.roundedRect(margin, y, contentWidth, boxUrgencyH, 2, 2, 'FD');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(153, 27, 27);
    doc.setFontSize(9.5);
    doc.text(urgencyLines, margin + 5, y + 7, { maxWidth: contentWidth - 10 });
    y += boxUrgencyH + 15;

    // Nota de Empatía
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const empLines = doc.splitTextToSize(`"${recommendation.empathyNote}"`, contentWidth);
    doc.text(empLines, margin, y, { maxWidth: contentWidth });
    
    // Footer P1
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Informe generado por Moreira & Fernández - Página 1 de 2", pageWidth / 2, 285, { align: 'center' });

    // --- PÁGINA 2: HOJA DE RUTA DETALLADA ---
    doc.addPage();
    y = 25; // Subido 0.5cm (de 30 a 25)

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Hoja de Ruta Sugerida", margin, y);
    y += 9; // Reducido de 10 a 9
    
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Recomendaciones profesionales para blindar su posición legal hoy mismo:", margin, y);
    y += 12; // Reducido de 15 a 12

    // Pasos / Recomendaciones
    recommendation.nextSteps.forEach((step, i) => {
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, y - 4, 6, 6, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}`, margin + 3, y, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const stepLines = doc.splitTextToSize(step, contentWidth - 15);
      doc.text(stepLines, margin + 10, y, { align: 'left', maxWidth: contentWidth - 15 });
      y += (stepLines.length * 5.5) + 4.5; // Reducido de 6 a 4.5 (1.5mm menos entre puntos)
      
      if (y > 225) { // Ajustado para aprovechar más la página
        doc.addPage();
        y = 30;
      }
    });

    y = Math.max(y + 6, 198); // Reducido el margen superior del cajetín y el floor de 205 a 198

    // Bloque Contacto Premium
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD'); 
    
    y += 10;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11); 
    doc.text("Sesión de Auditoría Gratuita", margin + 8, y);
    
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5); 
    doc.setTextColor(71, 85, 105);
    doc.text("Consulte este informe con nuestros abogados llamando al:", margin + 8, y);
    
    y += 11;
    doc.setFontSize(16); 
    doc.setTextColor(15, 23, 42);
    doc.text("+881 89 39 92", margin + 8, y);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("consultas@moreirayfernandez.es", pageWidth - margin - 8, y - 3, { align: 'right' });
    doc.text("www.moreirayfernandez.es", pageWidth - margin - 8, y + 2, { align: 'right' });

    // Footer P2
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Página 2 de 2 - Este informe no sustituye a la contratación formal de servicios jurídicos.", pageWidth / 2, 285, { align: 'center' });

    doc.save(`Moreira_Fernandez_Diagnostico_${answers.nombre.replace(/\s/g, '_')}.pdf`);
  };

  const renderProgress = () => {
    if (step > 8) return null;
    const progress = (step / totalSteps) * 100;
    return (
      <div className="relative">
        <div className="h-1 bg-slate-100 w-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-700 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Layout>
      {renderProgress()}
      
      <div className="p-8 sm:p-12">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase mb-6 tracking-wider border border-indigo-100">Gratis y Confidencial</span>
            <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">Obtén claridad sobre tu problema legal hoy mismo.</h2>
            
            <div className="space-y-4 mb-10">
              <p className="text-slate-600 text-lg leading-relaxed font-medium italic border-l-4 border-indigo-200 pl-4 bg-indigo-50/30 py-2 rounded-r-xl">
                "No tienes por qué enfrentar esto a solas. Dar el primer paso requiere valentía, y estamos aquí para acompañarte."
              </p>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Analizamos tu situación con total reserva para darte la hoja de ruta técnica que necesitas para recuperar tu tranquilidad.
              </p>
            </div>

            <button 
              onClick={next}
              className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              Comenzar Diagnóstico
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <p className="text-center mt-6 text-slate-400 text-xs font-semibold">Tus datos están protegidos y el análisis es 100% privado.</p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">¿Cuál es la naturaleza del caso?</h2>
            <p className="text-slate-500 mb-8 font-medium">Selecciona la especialidad para asignar a un experto.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'laboral', label: 'Laboral', desc: 'Despidos, EREs, Impagos', icon: '💼' },
                { id: 'familia', label: 'Familia', desc: 'Divorcios, Herencias', icon: '🏠' },
                { id: 'extranjeria', label: 'Extranjería', desc: 'Arraigo, Nacionalidad', icon: '🌍' },
                { id: 'penal', label: 'Penal', desc: 'Defensa o Acusación', icon: '⚖️' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { handleChange('tipoProblema', opt.id); next(); }}
                  className={`text-left p-6 rounded-2xl border-2 transition-all group ${
                    answers.tipoProblema === opt.id 
                      ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50/50' 
                      : 'border-slate-50 bg-white hover:border-slate-200'
                  }`}
                >
                  <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform">{opt.icon}</span>
                  <div className="font-black text-slate-900 text-lg leading-none">{opt.label}</div>
                  <div className="text-xs text-slate-500 mt-2 font-medium">{opt.desc}</div>
                </button>
              ))}
            </div>
            <button onClick={back} className="mt-10 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">← Volver</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Describe lo ocurrido</h2>
            <p className="text-slate-500 mb-8 font-medium">Cuanto más detalles proporciones, mejor será el análisis.</p>
            <textarea autoFocus className="w-full h-48 p-6 rounded-3xl border-2 border-slate-50 bg-slate-50/30 focus:border-indigo-500 focus:bg-white focus:ring-8 focus:ring-indigo-50/50 transition-all outline-none text-slate-700 font-medium leading-relaxed text-lg" placeholder="..." value={answers.detalle} onChange={(e) => handleChange('detalle', e.target.value)} />
            <div className="mt-10 flex gap-4">
              <button onClick={back} className="px-8 py-5 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-colors">Atrás</button>
              <button onClick={next} disabled={answers.detalle.length < 15} className="flex-1 bg-slate-900 disabled:opacity-30 text-white font-bold py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98]">Continuar</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">¿Cómo te está afectando?</h2>
            <p className="text-slate-500 mb-8 font-medium">Esto nos ayuda a priorizar la sensibilidad de tu caso.</p>
            <div className="space-y-3">
              {[{ id: 'economico', label: 'Pérdida de dinero / Patrimonio', icon: '💰' }, { id: 'emocional', label: 'Estrés, ansiedad o insomnio', icon: '🧠' }, { id: 'profesional', label: 'Riesgo para mi carrera', icon: '📈' }, { id: 'familiar', label: 'Conflictos familiares', icon: '👨‍👩‍👧' }].map((opt) => (
                <button key={opt.id} onClick={() => toggleImpact(opt.id as ProblemImpact)} className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-5 ${answers.impacto.includes(opt.id as ProblemImpact) ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50/50' : 'border-slate-50 bg-white hover:border-slate-100'}`}>
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="font-bold text-slate-700">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-12 flex gap-4">
              <button onClick={back} className="px-8 py-5 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-2xl">Atrás</button>
              <button onClick={next} disabled={answers.impacto.length === 0} className="flex-1 bg-slate-900 disabled:opacity-30 text-white font-bold py-5 rounded-2xl shadow-xl">Casi listo</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">¿Has tomado alguna medida hasta ahora?</h2>
            <textarea className="w-full h-32 p-6 rounded-3xl border-2 border-slate-50 bg-slate-50/30 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-700 font-medium" placeholder="..." value={answers.accionesPrevias} onChange={(e) => handleChange('accionesPrevias', e.target.value)} />
            <div className="mt-10 flex gap-4">
              <button onClick={back} className="px-8 py-5 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-2xl">Atrás</button>
              <button onClick={next} className="flex-1 bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl">Continuar</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Plazo de resolución</h2>
            <div className="grid grid-cols-1 gap-4 mt-8">
              {[{ id: 'baja', label: 'Sin prisa', color: 'bg-green-500', desc: 'Solo quiero informarme.' }, { id: 'media', label: 'Próximos días', color: 'bg-amber-500', desc: 'Quiero evitar que el problema crezca.' }, { id: 'grave', label: '¡URGENTE!', color: 'bg-red-500', desc: 'Hay un plazo legal inminente.' }].map((lvl) => (
                <button key={lvl.id} onClick={() => { handleChange('urgencia', lvl.id); next(); }} className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-6 ${answers.urgencia === lvl.id ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50/50' : 'border-slate-50 bg-white hover:border-slate-200'}`}>
                  <div className={`w-3 h-3 rounded-full ${lvl.color} shadow-lg shrink-0`} />
                  <div>
                    <div className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">{lvl.label}</div>
                    <div className="text-xs text-slate-500 font-medium">{lvl.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={back} className="mt-10 text-slate-400 font-bold text-xs uppercase tracking-widest">← Volver</button>
          </div>
        )}

        {step === 7 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Último paso</h2>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <button onClick={() => { handleChange('puedeDecidir', 'si'); handleGenerateResult(); }} className="p-5 bg-white border-2 border-slate-50 hover:border-indigo-600 rounded-2xl font-bold text-slate-700 transition-all text-sm uppercase tracking-wide">Sí, soy el titular</button>
              <button onClick={() => { handleChange('puedeDecidir', 'comparte'); handleGenerateResult(); }} className="p-5 bg-white border-2 border-slate-50 hover:border-indigo-600 rounded-2xl font-bold text-slate-700 transition-all text-sm uppercase tracking-wide">Decido en familia</button>
              <button onClick={() => { handleChange('puedeDecidir', 'no'); handleGenerateResult(); }} className="p-5 bg-white border-2 border-slate-50 hover:border-indigo-600 rounded-2xl font-bold text-slate-700 transition-all text-sm uppercase tracking-wide">Ayudo a alguien</button>
            </div>
            <button onClick={back} className="mt-12 text-slate-400 font-bold text-xs uppercase tracking-widest">Atrás</button>
          </div>
        )}

        {step === 8 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {loading ? (
              <div className="flex flex-col items-center py-24">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Analizando tu situación...</h2>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <div className="inline-block px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">Análisis Completado</div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tu hoja de ruta está lista.</h2>
                </div>
                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-indigo-100/30 p-8 sm:p-12 space-y-10">
                  <section className="space-y-4">
                    <h4 className="font-black uppercase tracking-widest text-[11px] text-indigo-600">Lectura Estratégica</h4>
                    <p className="text-slate-800 text-lg leading-relaxed font-medium">{recommendation?.insight}</p>
                  </section>
                  <div className="bg-indigo-50/50 rounded-3xl p-8 italic text-indigo-900/80 font-medium">"{recommendation?.empathyNote}"</div>
                  <section className="space-y-6">
                    <h4 className="font-black uppercase tracking-widest text-[11px] text-amber-600">Factores Críticos</h4>
                    <p className="text-slate-600 font-medium leading-relaxed">{recommendation?.riskAnalysis}</p>
                    <div className="flex items-start gap-4 text-red-700 bg-red-50 p-5 rounded-2xl border border-red-100 font-bold text-sm">
                      <span>{recommendation?.urgencyWarning}</span>
                    </div>
                  </section>
                  <section className="space-y-6">
                    <h4 className="font-black uppercase tracking-widest text-[11px] text-slate-400">Próximos Pasos</h4>
                    <div className="space-y-3">
                      {recommendation?.nextSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">{i+1}</span>
                          <span className="text-slate-700 font-bold leading-tight">{step}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
                <div className="text-center space-y-10 py-6">
                  <form onSubmit={handleFinalSubmit} className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 space-y-5">
                    <input required className="w-full p-5 bg-white rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-700" placeholder="Nombre" value={answers.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
                    <input required type="tel" className="w-full p-5 bg-white rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-700" placeholder="Teléfono" value={answers.telefono} onChange={(e) => handleChange('telefono', e.target.value)} />
                    <input required type="email" className="w-full p-5 bg-white rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-700" placeholder="Email" value={answers.email} onChange={(e) => handleChange('email', e.target.value)} />
                    <button type="submit" disabled={isSending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-2xl shadow-2xl shadow-indigo-100 transition-all text-xl mt-6">
                      {isSending ? 'Enviando...' : 'Hablar con un Experto'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 9 && (
          <div className="text-center py-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight italic">¡Primer paso completado!</h2>
            <p className="text-slate-500 text-xl mb-12 max-w-sm mx-auto font-medium leading-relaxed">Un abogado de Moreira & Fernández revisará sus datos y le contactará en breve.</p>
            <div className="flex flex-col gap-6 items-center">
              <button onClick={downloadPDF} className="inline-flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white font-black px-10 py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Guardar Informe Completo
              </button>
              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 w-full max-w-md mx-auto space-y-4">
                 <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Moreira & Fernández Abogados</p>
                 <div className="text-indigo-600 text-3xl font-black tracking-tighter italic">+881 89 39 92</div>
              </div>
            </div>
            <button onClick={restart} className="mt-16 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">Volver al inicio</button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
