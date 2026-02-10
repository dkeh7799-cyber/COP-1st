
import React, { useState, useMemo } from 'react';
import { AppState, ProductType, MeasuredFlag, CorrectionRef } from './types';

const formatNum = (n: number | string) => {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return n;
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// 완전히 비어있는 초기 상태 정의
const emptyState: AppState = {
  general: { siteName: '', diagnosisDate: '', productType: '터보', manufacturer: '', manufacturingYear: '' },
  spec: { coolingCapacity: 0, coolingInput: 0, coldWaterFlow: 0, heatingCapacity: 0, heatingInput: 0, heatingWaterFlow: 0, coolingWaterFlow: 0 },
  measurement: { 
    coldWaterFlowMeasured: 'O', inputHeatMeasured: 'O',
    evapFlow: 0, evapInlet: 0, evapOutlet: 0,
    fuelConsumption: 0, condenserFlow: 0, condenserInlet: 0, condenserOutlet: 0
  },
  config: { targetColdOutlet: 0, targetCoolingRefTemp: 0, correctionRef: '냉각수 출구' }
};

// --- UI Components ---

const Accordion: React.FC<{ title: string; color: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, color, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4 transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className={`w-1.5 h-6 rounded-full ${color}`}></span>
          <h3 className="font-bold text-gray-800 tracking-tight text-base">{title}</h3>
        </div>
        <span className="material-icons-round transition-transform duration-300 text-gray-400" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
      </button>
      {isOpen && <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
};

const SegmentedControl: React.FC<{ label: string; value: MeasuredFlag; onChange: (v: MeasuredFlag) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col flex-1 bg-gray-50/50 border border-gray-100 p-4 rounded-[2rem] transition-all">
    <span className="text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-widest text-center">{label}</span>
    <div className="relative flex bg-white rounded-2xl p-1 shadow-inner border border-gray-100">
      <div 
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 shadow-sm ${value === 'O' ? 'left-1 bg-status-green' : 'left-[calc(50%+2px)] bg-red-500'}`}
      />
      <button 
        onClick={() => onChange('O')}
        className={`relative z-10 flex-1 py-2 text-[11px] font-black transition-colors duration-300 ${value === 'O' ? 'text-white' : 'text-gray-400'}`}
      >
        측정
      </button>
      <button 
        onClick={() => onChange('X')}
        className={`relative z-10 flex-1 py-2 text-[11px] font-black transition-colors duration-300 ${value === 'X' ? 'text-white' : 'text-gray-400'}`}
      >
        미측정
      </button>
    </div>
  </div>
);

const InputField: React.FC<{ label: string; value: string | number; onChange: (val: string) => void; unit?: string; type?: string; inputWidth?: string }> = ({ label, value, onChange, unit, type = "number", inputWidth = "w-32" }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-600 font-semibold">{label}</span>
    <div className="flex items-center">
      <input 
        type={type}
        step="any"
        value={value === 0 && type === "number" ? "" : value}
        placeholder={type === "number" ? "0" : ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputWidth} bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-right font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-sm`}
      />
      {unit && <span className="text-[10px] text-gray-400 font-bold ml-3 w-14 text-left lowercase">{unit}</span>}
    </div>
  </div>
);

const DisplayRow: React.FC<{ label: string; value: string | number; unit?: string; color?: string; size?: string; isResult?: boolean }> = ({ label, value, unit, color = "text-gray-800", size = "text-sm", isResult = false }) => (
  <div className={`flex justify-between items-center py-3 border-b border-gray-50 last:border-0 ${isResult ? 'bg-white/40 px-2 rounded-lg' : ''}`}>
    <span className="text-sm text-gray-600 font-semibold">{label}</span>
    <div className="flex items-center">
      <span className={`font-black text-right ${color} ${size} min-w-[8rem] pr-[12px]`}>
        {typeof value === 'number' ? formatNum(value) : value}
      </span>
      {unit && <span className="text-[10px] text-gray-400 font-bold ml-3 w-14 text-left lowercase">{unit}</span>}
    </div>
  </div>
);

// --- Main App ---

const App: React.FC = () => {
  const [data, setData] = useState<AppState>({
    general: { siteName: '서울 마포 센터', diagnosisDate: '2024-05-20', productType: '직화식', manufacturer: '범양', manufacturingYear: '2001' },
    spec: { coolingCapacity: 120, coolingInput: 106, coldWaterFlow: 74, heatingCapacity: 120000, heatingInput: 124, heatingWaterFlow: 0, coolingWaterFlow: 92 },
    measurement: { 
      coldWaterFlowMeasured: 'O', inputHeatMeasured: 'O',
      evapFlow: 57, evapInlet: 13.9, evapOutlet: 9.0,
      fuelConsumption: 89.5, condenserFlow: 127, condenserInlet: 30.1, condenserOutlet: 32.9
    },
    config: { targetColdOutlet: 7, targetCoolingRefTemp: 37, correctionRef: '냉각수 출구' }
  });

  const results = useMemo(() => {
    const pt = data.general.productType;
    const isElectric = ['터보', '스크류', 'ISC'].includes(pt);
    const s = data.spec;
    const m = data.measurement;
    
    const unitInputHeat = isElectric ? "kW" : (pt === '직화식' ? "Nm3/h" : "Mcal");
    
    let specCop = 0;
    if (isElectric) specCop = s.coolingInput ? (s.coolingCapacity * 3024) / (s.coolingInput * 860) : 0;
    else if (pt === '직화식') specCop = s.coolingInput ? (s.coolingCapacity * 3024) / (s.coolingInput * 10400) : 0;
    else specCop = s.coolingInput ? (s.coolingCapacity * 3024) / (s.coolingInput * 1000) : 0;

    const heatingEff = (pt === '직화식' && s.heatingInput) ? (s.heatingCapacity / (s.heatingInput * 10400)) : 0;
    const measuredEvapHeat = m.evapFlow * 1000 * (m.evapInlet - m.evapOutlet);
    const usRT = measuredEvapHeat / 3024;

    let measuredInputHeat = 0;
    if (isElectric) measuredInputHeat = m.fuelConsumption * 860;
    else if (pt === '직화식') measuredInputHeat = m.fuelConsumption * 10400;
    else measuredInputHeat = m.fuelConsumption * 1000;

    const measuredCondenserHeat = m.condenserFlow * 1000 * (m.condenserOutlet - m.condenserInlet);

    let currentCop = 0;
    if (m.coldWaterFlowMeasured === 'O' && m.inputHeatMeasured === 'O') {
      currentCop = measuredInputHeat ? measuredEvapHeat / measuredInputHeat : 0;
    } else if (m.coldWaterFlowMeasured === 'O' && m.inputHeatMeasured === 'X') {
      const heatDiff = measuredCondenserHeat - measuredEvapHeat;
      currentCop = heatDiff > 0 ? measuredEvapHeat / heatDiff : 0;
    } else if (m.coldWaterFlowMeasured === 'X' && m.inputHeatMeasured === 'O') {
      currentCop = measuredInputHeat ? (measuredCondenserHeat - measuredInputHeat) / measuredInputHeat : 0;
    }

    const coeff = isElectric ? 0.025 : 0.015;
    const coolingMeasuredTemp = data.config.correctionRef === '냉각수 출구' ? m.condenserOutlet : m.condenserInlet;
    const correctionFactor = 1 + ((data.config.targetColdOutlet - m.evapOutlet) * coeff + (coolingMeasuredTemp - data.config.targetCoolingRefTemp) * coeff);
    const correctionCop = currentCop * correctionFactor;

    const perfDrop = specCop ? ((specCop - correctionCop) / specCop) * 100 : 0;
    const loadRatio = s.coolingCapacity ? (measuredEvapHeat / (s.coolingCapacity * 3024)) * 100 : 0;
    const ioRatio = measuredCondenserHeat ? ((measuredEvapHeat + measuredInputHeat) / measuredCondenserHeat) * 100 : 0;
    const flowRatioCold = s.coldWaterFlow ? (m.evapFlow / s.coldWaterFlow) * 100 : 0;
    const flowRatioCooling = s.coolingWaterFlow ? (m.condenserFlow / s.coolingWaterFlow) * 100 : 0;

    return {
      unitInputHeat,
      specCop,
      heatingEff,
      measuredEvapHeat,
      usRT,
      measuredInputHeat,
      measuredCondenserHeat,
      currentCop,
      correctionCop,
      perfDrop,
      loadRatio,
      ioRatio,
      flowRatioCold,
      flowRatioCooling
    };
  }, [data]);

  const status = useMemo(() => {
    const drop = results.perfDrop;
    if (drop >= 40) return { label: '심각', color: 'bg-red-600', text: 'text-red-600', icon: 'warning' };
    if (drop >= 20) return { label: '주의', color: 'bg-orange-500', text: 'text-orange-500', icon: 'report_problem' };
    if (drop >= 10) return { label: '보통', color: 'bg-green-500', text: 'text-green-500', icon: 'check_circle' };
    return { label: '양호', color: 'bg-blue-600', text: 'text-blue-600', icon: 'stars' };
  }, [results.perfDrop]);

  const isElectric = ['터보', '스크류', 'ISC'].includes(data.general.productType);

  const handleReset = () => {
    if (window.confirm("입력하신 모든 내용을 초기화하시겠습니까?")) {
      setData(emptyState);
    }
  };

  const handleSave = () => {
    try {
      const exportData = {
        ...data,
        analysisResults: {
          cop: results.currentCop,
          correctedCop: results.correctionCop,
          performanceDrop: results.perfDrop,
          loadRatio: results.loadRatio,
          timestamp: new Date().toISOString()
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `COP_Analysis_${data.general.siteName || 'Unknown'}_${new Date().toISOString().split('T')[0]}.json`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert("데이터가 파일로 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("Save error:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8FAFC] pb-20 font-sans antialiased text-slate-900">
      {/* --- 분석 결과 요약 헤더 --- */}
      <div className={`relative transition-all duration-700 ${status.color} shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] rounded-b-[4rem] overflow-hidden`}>
        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-48 h-48 rounded-full bg-black/5 blur-2xl pointer-events-none"></div>
        
        <div className="relative p-8 pt-12 pb-10 text-white">
          <div className="flex justify-between items-start">
            <div className="space-y-6">
              <div className="space-y-0.5">
                <h1 className="text-[11px] font-black opacity-70 uppercase tracking-[0.2em]">보정 COP</h1>
                <div className="text-7xl font-black tracking-tighter drop-shadow-2xl">{results.correctionCop.toFixed(2)}</div>
              </div>
              <div className="flex gap-6 items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">COP</span>
                  <span className="text-3xl font-black">{results.currentCop.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">성능 상태</span>
                <div className={`px-5 py-2 rounded-2xl text-[12px] font-black bg-white/95 ${status.text} shadow-2xl flex items-center gap-2 border border-white/20`}>
                  <span className="material-icons-round text-[18px]">{status.icon}</span>
                  {status.label}
                </div>
              </div>
              <div className="bg-black/10 backdrop-blur-xl rounded-[2rem] px-6 py-4 border border-white/10 text-right shadow-inner">
                 <p className="text-[9px] font-black opacity-60 uppercase tracking-[0.1em] mb-1">성능 저하율</p>
                 <p className="text-3xl font-black text-white leading-none">{results.perfDrop.toFixed(1)}<span className="text-lg opacity-60 ml-0.5">%</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="px-5 mt-10 space-y-8">
        <Accordion title="일반 현황" color="bg-primary" defaultOpen={false}>
          <div className="space-y-1 mt-2">
            <InputField label="현장명" value={data.general.siteName} onChange={(v) => setData({...data, general: {...data.general, siteName: v}})} type="text" inputWidth="w-full max-w-[14rem]" />
            <InputField label="진단일자" value={data.general.diagnosisDate} onChange={(v) => setData({...data, general: {...data.general, diagnosisDate: v}})} type="date" inputWidth="w-full max-w-[14rem]" />
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-600 font-semibold">제품구분</span>
              <div className="relative">
                <select 
                  value={data.general.productType}
                  onChange={(e) => setData({...data, general: {...data.general, productType: e.target.value as ProductType}})}
                  className="w-40 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-black text-sm text-gray-800 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm text-right pr-10 appearance-none"
                >
                  {['터보', '스크류', 'ISC', '직화식', '중온수', '스팀'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="material-icons-round absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
              </div>
            </div>
            <InputField label="제조사" value={data.general.manufacturer} onChange={(v) => setData({...data, general: {...data.general, manufacturer: v}})} type="text" />
            <InputField label="제조년월" value={data.general.manufacturingYear} onChange={(v) => setData({...data, general: {...data.general, manufacturingYear: v}})} type="text" />
          </div>
        </Accordion>

        <Accordion title="사양 (Spec)" color="bg-secondary" defaultOpen={false}>
          <div className="space-y-6 mt-2">
            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-icons-round text-blue-500 text-[22px]">ac_unit</span>
                <h4 className="text-[12px] font-black text-blue-600 uppercase tracking-widest">냉방 운전 사양</h4>
              </div>
              <InputField label="능력 (USRT)" value={data.spec.coolingCapacity} onChange={(v) => setData({...data, spec: {...data.spec, coolingCapacity: Number(v)}})} />
              <InputField label={`입열량 (${results.unitInputHeat})`} value={data.spec.coolingInput} onChange={(v) => setData({...data, spec: {...data.spec, coolingInput: Number(v)}})} />
              <DisplayRow label="COP" value={results.specCop.toFixed(2)} color="text-blue-700" size="text-xl" />
              <InputField label="냉수 유량 (CMH)" value={data.spec.coldWaterFlow} onChange={(v) => setData({...data, spec: {...data.spec, coldWaterFlow: Number(v)}})} />
            </div>

            {data.general.productType === '직화식' && (
              <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <span className="material-icons-round text-orange-500 text-[22px]">local_fire_department</span>
                  <h4 className="text-[12px] font-black text-orange-600 uppercase tracking-widest">난방 운전 사양</h4>
                </div>
                <InputField label="능력 (kcal/h)" value={data.spec.heatingCapacity} onChange={(v) => setData({...data, spec: {...data.spec, heatingCapacity: Number(v)}})} />
                <InputField label="입열량 (Nm3/h)" value={data.spec.heatingInput} onChange={(v) => setData({...data, spec: {...data.spec, heatingInput: Number(v)}})} />
                <InputField label="온수 유량 (CMH)" value={data.spec.heatingWaterFlow} onChange={(v) => setData({...data, spec: {...data.spec, heatingWaterFlow: Number(v)}})} />
                <DisplayRow label="효율" value={`${(results.heatingEff * 100).toFixed(1)}%`} color="text-orange-700" size="text-xl" />
              </div>
            )}

            <div className="px-3">
              <InputField label="냉각수 유량 (CMH)" value={data.spec.coolingWaterFlow} onChange={(v) => setData({...data, spec: {...data.spec, coolingWaterFlow: Number(v)}})} />
            </div>
          </div>
        </Accordion>

        <section>
          <div className="flex items-center justify-between mb-5 px-3">
            <div className="flex items-center space-x-3">
              <span className="w-1.5 h-6 rounded-full bg-status-green"></span>
              <h3 className="font-bold text-gray-800 tracking-tight text-base">측정 데이터 입력</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-[3rem] p-7 shadow-sm border border-gray-100 space-y-10">
            <div className="flex gap-5">
              <SegmentedControl label="냉수 유량 측정" value={data.measurement.coldWaterFlowMeasured} onChange={(v) => setData({...data, measurement: {...data.measurement, coldWaterFlowMeasured: v}})} />
              <SegmentedControl label="입열량 측정" value={data.measurement.inputHeatMeasured} onChange={(v) => setData({...data, measurement: {...data.measurement, inputHeatMeasured: v}})} />
            </div>

            <div className="bg-slate-50/70 rounded-[2.5rem] p-7 border border-slate-100 shadow-inner">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 flex items-center justify-center shadow-sm">
                  <span className="material-icons-round text-blue-600 text-[20px]">water_drop</span>
                </div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">증발기(Eva.)</h4>
              </div>
              <InputField label="냉수 유량 (CMH)" value={data.measurement.evapFlow} onChange={(v) => setData({...data, measurement: {...data.measurement, evapFlow: Number(v)}})} />
              <InputField label="냉수 입구 (°C)" value={data.measurement.evapInlet} onChange={(v) => setData({...data, measurement: {...data.measurement, evapInlet: Number(v)}})} />
              <InputField label="냉수 출구 (°C)" value={data.measurement.evapOutlet} onChange={(v) => setData({...data, measurement: {...data.measurement, evapOutlet: Number(v)}})} />
              <div className="mt-8 pt-7 border-t border-dashed border-slate-200 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-tight">증발열량</span>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-700 mb-1">{formatNum(results.measuredEvapHeat)} <span className="text-[10px] opacity-60 font-bold lowercase">kcal/h</span></div>
                  <div className="text-4xl font-black text-blue-800 tracking-tighter">
                    {Math.round(results.usRT)} <span className="text-xs font-bold opacity-50 uppercase">USRT</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50/30 rounded-[2.5rem] p-7 border border-red-100 shadow-inner">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-2xl bg-red-100 flex items-center justify-center shadow-sm">
                  <span className="material-icons-round text-red-600 text-[20px]">local_fire_department</span>
                </div>
                <h4 className="text-[11px] font-black text-red-400 uppercase tracking-[0.15em]">에너지 소비량</h4>
              </div>
              <InputField label={isElectric ? "소비전력 (kW)" : "연료소비량 (Nm3/h)"} value={data.measurement.fuelConsumption} onChange={(v) => setData({...data, measurement: {...data.measurement, fuelConsumption: Number(v)}})} />
              <DisplayRow label="입열량" value={results.measuredInputHeat} unit="kcal/h" color="text-red-700 font-black" size="text-lg" />
            </div>

            <div className="bg-emerald-50/30 rounded-[2.5rem] p-7 border border-emerald-100 shadow-inner">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-sm">
                  <span className="material-icons-round text-emerald-600 text-[20px]">cyclone</span>
                </div>
                <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.15em]">응축기(Cond.)</h4>
              </div>
              <InputField label="냉각수 유량 (CMH)" value={data.measurement.condenserFlow} onChange={(v) => setData({...data, measurement: {...data.measurement, condenserFlow: Number(v)}})} />
              <InputField label="입구 온도 (°C)" value={data.measurement.condenserInlet} onChange={(v) => setData({...data, measurement: {...data.measurement, condenserInlet: Number(v)}})} />
              <InputField label="출구 온도 (°C)" value={data.measurement.condenserOutlet} onChange={(v) => setData({...data, measurement: {...data.measurement, condenserOutlet: Number(v)}})} />
              <DisplayRow label="응축열량" value={results.measuredCondenserHeat} unit="kcal/h" color="text-slate-700 font-black" size="text-lg" />
            </div>
          </div>
        </section>

        <div className="bg-white rounded-[3.5rem] p-9 shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center space-x-3">
            <span className="w-1.5 h-6 rounded-full bg-purple-500"></span>
            <h3 className="font-bold text-gray-800 tracking-tight text-base">상세 분석 결과</h3>
          </div>

          <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/30 rounded-[2.5rem] p-7 shadow-inner border border-purple-100 space-y-5">
             <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-white/70 rounded-2xl border border-purple-200/40 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-purple-400 text-[20px]">thermostat</span>
                    <span className="text-[12px] text-purple-700 font-black uppercase tracking-widest">보정 기준 냉수 출구</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="any"
                      value={data.config.targetColdOutlet === 0 ? "" : data.config.targetColdOutlet} 
                      onChange={(e) => setData({...data, config: {...data.config, targetColdOutlet: Number(e.target.value)}})} 
                      className="w-20 bg-white border border-purple-200 rounded-xl px-2 py-1.5 text-right font-black text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm" 
                      placeholder="0" 
                    />
                    <span className="text-[11px] font-bold text-purple-400">°C</span>
                  </div>
                </div>

                <div className="flex flex-col p-4 bg-white/70 rounded-2xl border border-purple-200/40 gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-purple-400 text-[20px]">tune</span>
                    <span className="text-[12px] text-purple-700 font-black uppercase tracking-widest">보정 기준 냉각수</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="relative flex-1 mr-3">
                      <select 
                        value={data.config.correctionRef} 
                        onChange={(e) => setData({...data, config: {...data.config, correctionRef: e.target.value as CorrectionRef}})} 
                        className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 font-black text-[12px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none text-left shadow-sm"
                      >
                        <option value="냉각수 출구">출구</option>
                        <option value="냉각수 입구">입구</option>
                      </select>
                      <span className="material-icons-round absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none text-[18px]">expand_more</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        step="any"
                        value={data.config.targetCoolingRefTemp === 0 ? "" : data.config.targetCoolingRefTemp} 
                        onChange={(e) => setData({...data, config: {...data.config, targetCoolingRefTemp: Number(e.target.value)}})} 
                        className="w-20 bg-white border border-purple-200 rounded-xl px-2 py-1.5 text-right font-black text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm" 
                        placeholder="0" 
                      />
                      <span className="text-[11px] font-bold text-purple-400">°C</span>
                    </div>
                  </div>
                </div>
             </div>
             <div className="pt-6 mt-2 border-t border-purple-200 flex justify-between items-center">
                <span className="text-sm font-black text-purple-800 uppercase tracking-tight">보정 COP</span>
                <span className="text-6xl font-black text-purple-800 tracking-tighter drop-shadow-md">{results.correctionCop.toFixed(2)}</span>
             </div>
          </div>

          <div className="space-y-1 divide-y divide-gray-50 px-2">
            <div className="flex justify-between py-5 items-center">
              <span className="text-sm font-bold text-gray-600">성능 저하율</span>
              <span className={`font-black text-3xl ${status.text}`}>{results.perfDrop.toFixed(1)}<span className="text-base opacity-70 ml-1">% (↓)</span></span>
            </div>
            <DisplayRow label="부하율" value={`${results.loadRatio.toFixed(1)}%`} />
            <DisplayRow label="입출열비" value={`${results.ioRatio.toFixed(1)}%`} color={results.ioRatio > 120 ? 'text-red-600' : 'text-slate-800'} />
            <DisplayRow label="유량비 (냉수)" value={`${results.flowRatioCold.toFixed(1)}%`} />
            <DisplayRow label="유량비 (냉각수)" value={`${results.flowRatioCooling.toFixed(1)}%`} />
          </div>
        </div>

        {/* --- 하단 버튼 (스크롤 마지막 위치) --- */}
        <div className="flex gap-5 pt-8 pb-12">
          <button 
            onClick={handleReset}
            className="flex-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-[2rem] py-5 font-black flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-200 shadow-sm text-base"
          >
            <span className="material-icons-round">refresh</span> 초기화
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 bg-primary text-white rounded-[2rem] py-5 font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 active:scale-95 transition-all hover:brightness-110 text-base"
          >
            <span className="material-icons-round">save</span> 저장하기
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
