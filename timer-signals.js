/* Signaux locaux : aucun réseau, aucun bip déclenché par le rendu. */
(function(){
 window.createTimerSignals=function(settings,AudioCtor,vibrate){
  let ctx=null;const events=new Set();
  function prime(){try{if(!ctx&&AudioCtor)ctx=new AudioCtor();if(ctx?.state==='suspended')ctx.resume()?.catch(()=>{});}catch(e){ctx=null}}
  function emit(key,kind){if(events.has(key))return false;events.add(key);const s=settings();if(s.vibrationsEnabled!==false){try{vibrate?.(kind==='end'?[60,40,90]:kind==='rest'?35:20)}catch(e){}}
   if(s.timerSoundsEnabled===false||!ctx||ctx.state!=='running')return true;
   const volume=Math.max(0,Math.min(1,Number(s.timerVolume??.35)));if(!volume)return true;
   const sequences={warning:[[660,.09]],tick:[[880,.07]],end:[[880,.13],[1175,.22]],rest:[[660,.12],[440,.18]],effort:[[660,.1],[990,.16]]};
   try{let time=ctx.currentTime+.01;for(const[f,d]of(sequences[kind]||sequences.tick)){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume*.22,time+.01);gain.gain.exponentialRampToValueAtTime(.0001,time+d);osc.connect(gain);gain.connect(ctx.destination);osc.start(time);osc.stop(time+d+.01);osc.onended=()=>{osc.disconnect();gain.disconnect()};time+=d+.055;}}catch(e){}return true;
  }
  return {prime,phase:(id,type)=>emit(id+':phase',type),tick:(id,left)=>{if(left===10)emit(id+':10','warning');if(left>=1&&left<=3)emit(id+':'+left,'tick')},end:id=>emit(id+':end','end'),reset:()=>events.clear()};
 };
})();
