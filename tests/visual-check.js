async (page) => {
 await page.reload();
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Rice ਝੋਨਾ',exact:true}).click();
 await page.getByRole('button',{name:'Stage 9: Dough and ripening',exact:true}).click();
 await page.screenshot({path:'output/playwright/phone-rice.png'});
 await page.getByRole('button',{name:'Wheat ਕਣਕ',exact:true}).click();
 await page.getByRole('button',{name:'Stage 7: Heading and flowering',exact:true}).click();
 await page.screenshot({path:'output/playwright/phone-wheat.png'});
 await page.setViewportSize({width:390,height:667});
 await page.screenshot({path:'output/playwright/phone-short.png'});
 const compact=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,canvasBottom:document.querySelector('canvas').getBoundingClientRect().bottom,renderer:Fieldnotes.Scene3D.info()}));
 if(compact.width!==390||compact.height!==667||compact.canvasBottom!==667)throw Error('Short phone layout failed');
 await page.setViewportSize({width:1440,height:1000});
 await page.getByRole('button',{name:'Rice ਝੋਨਾ',exact:true}).click();
 await page.getByRole('button',{name:'Stage 9: Dough and ripening',exact:true}).click();
 await page.screenshot({path:'output/playwright/desktop-lateral.png'});
 return {shortPhone:compact,allLayoutsPassed:true};
}
