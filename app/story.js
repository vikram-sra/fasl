/* Directed story: nine chapters, each with a date range, a view and one line of copy. Punjabi awaits independent review. */
const Story=(()=>{
  const ws=Sim.wheatStart();
  const list=[
    {id:'seed',from:0,to:27,view:'plant',title:['A seed begins','ਬੀਜ ਤੋਂ ਸ਼ੁਰੂਆਤ'],copy:['Rice starts in a small nursery, then moves to the flooded field.','ਝੋਨਾ ਛੋਟੀ ਪਨੀਰੀ ਵਿੱਚ ਸ਼ੁਰੂ ਹੁੰਦਾ ਹੈ, ਫਿਰ ਪਾਣੀ ਭਰੇ ਖੇਤ ਵਿੱਚ ਲਗਦਾ ਹੈ।']},
    {id:'roots',from:27,to:45,view:'underground',title:['Roots search for water','ਜੜ੍ਹਾਂ ਪਾਣੀ ਲੱਭਦੀਆਂ ਹਨ'],copy:['Roots spread through the soil while the tubewell draws from the water below.','ਜੜ੍ਹਾਂ ਮਿੱਟੀ ਵਿੱਚ ਫੈਲਦੀਆਂ ਹਨ ਅਤੇ ਟਿਊਬਵੈੱਲ ਹੇਠਲੇ ਪਾਣੀ ਨੂੰ ਖਿੱਚਦਾ ਹੈ।']},
    {id:'tillers',from:45,to:75,view:'field',title:['More stems, more water','ਹੋਰ ਤਣੇ, ਹੋਰ ਪਾਣੀ'],copy:['Each plant sends up new stems. Rain and automatic watering keep the field wet.','ਹਰ ਪੌਦਾ ਨਵੇਂ ਤਣੇ ਕੱਢਦਾ ਹੈ। ਮੀਂਹ ਅਤੇ ਆਪਣੇ ਆਪ ਸਿੰਚਾਈ ਖੇਤ ਨੂੰ ਗਿੱਲਾ ਰੱਖਦੇ ਹਨ।']},
    {id:'heading',from:75,to:105,view:'plant',title:['Flowers, then grain','ਫੁੱਲ, ਫਿਰ ਦਾਣੇ'],copy:['Tiny flowers open on each grain head, and the grain fills.','ਹਰ ਮੁੰਜਰ ਉੱਤੇ ਛੋਟੇ ਫੁੱਲ ਖਿੜਦੇ ਹਨ ਅਤੇ ਦਾਣੇ ਭਰਦੇ ਹਨ।']},
    {id:'harvest',from:105,to:122,view:'field',title:['The rice turns gold','ਝੋਨਾ ਸੁਨਹਿਰੀ ਹੁੰਦਾ ਹੈ'],copy:['The field dries and is harvested, and the rice is milled for the bowl.','ਖੇਤ ਸੁੱਕਦਾ ਹੈ, ਵਾਢੀ ਹੁੰਦੀ ਹੈ ਅਤੇ ਚੌਲ ਕੌਲੀ ਲਈ ਤਿਆਰ ਹੁੰਦੇ ਹਨ।']},
    {id:'straw',from:122,to:ws+3,view:'field',title:['Straw, then wheat','ਪਰਾਲੀ, ਫਿਰ ਕਣਕ'],copy:['The same field is sown with wheat. The straw is kept as mulch in this path.','ਉਸੇ ਖੇਤ ਵਿੱਚ ਕਣਕ ਬੀਜੀ ਜਾਂਦੀ ਹੈ। ਇਸ ਰਾਹ ਵਿੱਚ ਪਰਾਲੀ ਮਲਚ ਵਜੋਂ ਰਹਿੰਦੀ ਹੈ।']},
    {id:'wheat',from:ws+3,to:ws+80,view:'underground',title:['Wheat drinks from below','ਕਣਕ ਹੇਠੋਂ ਪਾਣੀ ਲੈਂਦੀ ਹੈ'],copy:['Wheat roots go deeper. The same underground water supplies the winter crop.','ਕਣਕ ਦੀਆਂ ਜੜ੍ਹਾਂ ਹੋਰ ਡੂੰਘੀਆਂ ਜਾਂਦੀਆਂ ਹਨ। ਉਹੀ ਧਰਤੀ ਹੇਠਲਾ ਪਾਣੀ ਸਿਆਲ ਦੀ ਫ਼ਸਲ ਨੂੰ ਮਿਲਦਾ ਹੈ।']},
    {id:'grain',from:ws+80,to:ws+120,view:'plant',title:['The ears fill','ਸਿੱਟੇ ਭਰਦੇ ਹਨ'],copy:['Wheat ears emerge and the grain fills before it dries to gold.','ਕਣਕ ਦੇ ਸਿੱਟੇ ਨਿਕਲਦੇ ਹਨ ਅਤੇ ਸੁਨਹਿਰੀ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਦਾਣੇ ਭਰਦੇ ਹਨ।']},
    {id:'end',from:ws+120,to:Infinity,view:'field',title:['Two harvests, one source','ਦੋ ਵਾਢੀਆਂ, ਇੱਕ ਸਰੋਤ'],copy:['Both crops drew on the same soil and groundwater. Compare what each 100 g needed.','ਦੋਵੇਂ ਫ਼ਸਲਾਂ ਨੇ ਉਹੀ ਮਿੱਟੀ ਅਤੇ ਧਰਤੀ ਹੇਠਲਾ ਪਾਣੀ ਵਰਤਿਆ। ਹਰ 100 g ਦੀ ਲੋੜ ਦੀ ਤੁਲਨਾ ਕਰੋ।']}
  ];
  const indexAt=day=>{for(let i=list.length-1;i>=0;i--)if(day>=list[i].from)return i;return 0;};
  const progress=(i,day)=>{const c=list[i],end=Number.isFinite(c.to)?c.to:maxDay;return Math.max(0,Math.min(1,(day-c.from)/Math.max(1,end-c.from)));};
  return{list,indexAt,progress};
})();
