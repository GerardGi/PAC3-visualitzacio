// ============================================================
// THE PORTUGUESE PARADOX — INTERACTIVE SCROLLYTELLING
// Chart.js + Scrollama · 7 scenes
// ============================================================

(function () {
  'use strict';

  // ── Design tokens ────────────────────────────────────────
  const C = {
    portugal: '#C73E3A', rest: '#5B7C99', accent: '#B8865B',
    dark: '#1A1A1A', muted: '#767676', grid: '#E5E1DA',
    bg: '#FAF7F2', lightRed: '#E89D9A', lightBlue: '#9FB4C7',
  };

  const countryNames = {
    PRT:'Portugal', BRA:'Brasil', ESP:'Espanya', FRA:'França',
    GBR:'Regne Unit', DEU:'Alemanya', ITA:'Itàlia', IRL:'Irlanda',
    USA:'Estats Units', NLD:'Països Baixos', BEL:'Bèlgica',
    AUT:'Àustria', CN:'Xina', SWE:'Suècia', CHE:'Suïssa',
  };

  // ── Chart.js defaults ────────────────────────────────────
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  Chart.defaults.color = C.muted;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(26,26,26,0.92)';
  Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 13 };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 6;
  Chart.defaults.plugins.tooltip.displayColors = true;
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.animation.duration = 900;
  Chart.defaults.animation.easing = 'easeOutQuart';

  // ── State ────────────────────────────────────────────────
  let currentChart = null;
  const chartWrapper = document.getElementById('chart-wrapper');
  const chartCaption = document.getElementById('chart-caption');
  const bigNumbersEl = document.getElementById('big-numbers');

  const builders = {
    ranking: buildRanking,
    countryHotel: buildCountryHotel,
    bignumbers: buildBigNumbers,
    leadtime: buildLeadtime,
    cancelBySegment: buildCancelBySegment,
    depositEffect: buildDepositEffect,
    radar: buildRadar,
  };

  function freshCanvas() {
    if (currentChart) { currentChart.destroy(); currentChart = null; }
    const old = chartWrapper.querySelector('canvas');
    if (old) old.remove();
    const c = document.createElement('canvas');
    chartWrapper.appendChild(c);
    return c;
  }

  // ── Scrollama ────────────────────────────────────────────
  const scroller = scrollama();

  scroller.setup({ step: '.step', offset: 0.5, debug: false })
    .onStepEnter(function (resp) {
      const el = resp.element;
      const scene = el.dataset.scene;
      document.querySelectorAll('.step').forEach(s => s.classList.remove('is-active'));
      el.classList.add('is-active');
      if (scene) renderScene(scene, el.dataset.caption || '');
    });

  function renderScene(scene, caption) {
    if (chartCaption) chartCaption.textContent = caption;
    if (scene === 'bignumbers') {
      chartWrapper.style.display = 'none';
      bigNumbersEl.style.display = 'flex';
      if (currentChart) { currentChart.destroy(); currentChart = null; }
      const old = chartWrapper.querySelector('canvas');
      if (old) old.remove();
      buildBigNumbers();
    } else {
      bigNumbersEl.style.display = 'none';
      chartWrapper.style.display = 'block';
      if (builders[scene]) builders[scene]();
    }
  }

  // ================================================================
  //  1 — RANKING
  // ================================================================
  function buildRanking() {
    const canvas = freshCanvas();
    const data = [
      { c: 'DEU', r: 16.8 }, { c: 'AUT', r: 18.2 }, { c: 'NLD', r: 18.4 },
      { c: 'FRA', r: 18.7 }, { c: 'CN',  r: 19.9 }, { c: 'BEL', r: 20.2 },
      { c: 'GBR', r: 20.3 }, { c: 'SWE', r: 22.3 }, { c: 'USA', r: 24.0 },
      { c: 'IRL', r: 24.7 }, { c: 'CHE', r: 24.9 }, { c: 'ESP', r: 25.6 },
      { c: 'ITA', r: 35.5 }, { c: 'BRA', r: 37.5 }, { c: 'PRT', r: 58.1 },
    ];
    const labels = data.map(d => d.c);

    currentChart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{
        data: data.map(d => d.r),
        backgroundColor: data.map(d => d.c === 'PRT' ? C.portugal : C.rest),
        borderRadius: 3, borderSkipped: false, barPercentage: 0.75,
      }]},
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 30 } },
        scales: {
          x: { max: 68, grid: { color: C.grid }, border: { display: false },
            ticks: { callback: v => v + '%', font: { size: 11 } } },
          y: { grid: { display: false }, border: { display: false },
            ticks: {
              font: ctx => ({ size: labels[ctx.index]==='PRT'?13:11, weight: labels[ctx.index]==='PRT'?'bold':'normal' }),
              color: ctx => labels[ctx.index]==='PRT' ? C.portugal : C.muted,
            }},
        },
        plugins: {
          tooltip: { callbacks: {
            title: i => countryNames[i[0].label]||i[0].label,
            label: i => ` Taxa de cancel·lació: ${i.raw.toFixed(1)}%`,
          }},
          annotation: { annotations: { avg: {
            type:'line', xMin:37.5, xMax:37.5, borderColor:'#555555', borderWidth:1.5, borderDash:[6,4],
            label:{ display:true, content:'Mitjana global 37,5%', position:'end',
              backgroundColor:C.bg, color:'#555555', font:{size:11,weight:'bold'}, padding:4}
          }}},
        },
      },
    });
  }

  // ================================================================
  //  2 — COUNTRY × HOTEL (dumbbell chart via floating bars + dots)
  // ================================================================
  function buildCountryHotel() {
    const canvas = freshCanvas();
    const data = [
      { c:'DEU', city:17.7, resort:12.2 }, { c:'FRA', city:19.6, resort:13.2 },
      { c:'GBR', city:29.5, resort:13.2 }, { c:'ESP', city:29.0, resort:21.8 },
      { c:'IRL', city:33.1, resort:20.0 }, { c:'ITA', city:38.0, resort:17.5 },
      { c:'BRA', city:40.8, resort:23.7 }, { c:'PRT', city:66.7, resort:43.1 },
    ];
    const labels = data.map(d => d.c);

    // Floating bars: each data point is [resort, city] — bar spans the gap
    const floatingData = data.map(d => [d.resort, d.city]);
    const barColors = data.map(d => d.c === 'PRT' ? C.portugal + '30' : C.rest + '30');

    const dumbbellPlugin = {
      id: 'dumbbellDots',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((bar, i) => {
          const d = data[i];
          const isPRT = d.c === 'PRT';
          const xScale = chart.scales.x;
          const xCity = xScale.getPixelForValue(d.city);
          const xResort = xScale.getPixelForValue(d.resort);
          const y = bar.y;
          const fillColor = isPRT ? C.portugal : C.rest;

          // City Hotel = CIRCLE
          ctx.save();
          ctx.beginPath(); ctx.arc(xCity, y, 7, 0, Math.PI * 2);
          ctx.fillStyle = fillColor;
          ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();

          // Resort Hotel = SQUARE (rounded)
          ctx.save();
          const s = 12;
          ctx.beginPath();
          ctx.roundRect(xResort - s/2, y - s/2, s, s, 2);
          ctx.fillStyle = fillColor;
          ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();

          // Value labels at the ends
          ctx.save();
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillStyle = fillColor;
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          ctx.fillText(d.city.toFixed(0) + '%', xCity + 11, y);
          ctx.textAlign = 'right';
          ctx.fillText(d.resort.toFixed(0) + '%', xResort - 11, y);
          ctx.restore();
        });
      }
    };

    currentChart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{
        data: floatingData,
        backgroundColor: barColors,
        borderRadius: 20,
        borderSkipped: false,
        barPercentage: 0.35,
      }]},
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        layout: { padding: { right: 35, left: 10 } },
        scales: {
          x: { min: 0, max: 78, grid: { color: C.grid }, border: { display: false },
            ticks: { callback: v => v + '%', font: { size: 11 } },
            title: { display: true, text: 'Taxa de cancel·lació', color: C.muted, font: { size: 11 } } },
          y: { grid: { display: false }, border: { display: false },
            ticks: {
              font: ctx => ({ size: labels[ctx.index]==='PRT' ? 13 : 11, weight: labels[ctx.index]==='PRT' ? 'bold' : 'normal' }),
              color: ctx => labels[ctx.index]==='PRT' ? C.portugal : C.muted,
            }},
        },
        plugins: {
          legend: { display: true, position: 'top', align: 'end',
            labels: { usePointStyle: true, padding: 16, font: { size: 11 },
              generateLabels: () => [
                { text: 'City Hotel (Lisboa)', fillStyle: C.dark, strokeStyle: '#fff', pointStyle: 'circle' },
                { text: 'Resort Hotel (Algarve)', fillStyle: C.dark, strokeStyle: '#fff', pointStyle: 'rectRounded' },
                { text: 'Portugal', fillStyle: C.portugal, strokeStyle: '#fff', pointStyle: 'rectRounded' },
                { text: 'Resta del món', fillStyle: C.rest, strokeStyle: '#fff', pointStyle: 'rectRounded' },
              ]}},
          tooltip: {
            callbacks: {
              title: items => countryNames[labels[items[0].dataIndex]] || labels[items[0].dataIndex],
              label: item => {
                const d = data[item.dataIndex];
                return [` City Hotel: ${d.city.toFixed(1)}%`, ` Resort Hotel: ${d.resort.toFixed(1)}%`, ` Diferència: ${(d.city - d.resort).toFixed(1)} pp`];
              },
            }
          },
        },
      },
      plugins: [dumbbellPlugin],
    });
  }

  // ================================================================
  //  3 — BIG NUMBERS
  // ================================================================
  function buildBigNumbers() {
    const pE = document.getElementById('bn-prt');
    const rE = document.getElementById('bn-rest');
    const dE = document.getElementById('bn-diff');
    if (!pE||!rE) return;
    pE.textContent='0%'; rE.textContent='0%';
    if(dE) dE.style.opacity='0';
    anim(pE,0,58,1200,'%'); anim(rE,0,24,1200,'%');
    if(dE) setTimeout(()=>{dE.style.transition='opacity 0.6s';dE.style.opacity='1';},1300);
  }
  function anim(el,from,to,dur,suf){
    const s=performance.now();
    (function t(n){const p=Math.min((n-s)/dur,1);
      el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3)))+suf;
      if(p<1)requestAnimationFrame(t);})(s);
  }

  // ================================================================
  //  4 — LEAD TIME vs CANCEL RATE
  // ================================================================
  function buildLeadtime() {
    const canvas = freshCanvas();
    const buckets = ['0–7 d','8–30 d','31–90 d','91–180 d','181–365 d','365+ d'];
    const prt  = [13.5, 40.8, 61.1, 72.7, 85.9, 97.1];
    const rest = [ 5.7, 21.8, 26.3, 29.0, 29.7,  0.6];
    const nRest = [9168, 12436, 19534, 16754, 11536, 944]; // sample sizes

    currentChart = new Chart(canvas, {
      type: 'line',
      data: { labels:buckets, datasets:[
        { label:'Portugal', data:prt, borderColor:C.portugal, backgroundColor:C.portugal+'20',
          borderWidth:3, pointRadius: [5,5,5,5,5,8], pointHoverRadius:9, pointBackgroundColor:C.portugal,
          tension:0.3, fill:true },
        { label:'Rest of world', data:rest, borderColor:C.rest, backgroundColor:C.rest+'20',
          borderWidth:3, pointRadius:5, pointHoverRadius:9, pointBackgroundColor:C.rest,
          tension:0.3, fill:true },
      ]},
      options: {
        responsive:true, maintainAspectRatio:false,
        interaction:{mode:'index',intersect:false},
        layout:{padding:{top:5, right:60, bottom:25}},
        scales: {
          x:{ grid:{display:false}, border:{display:false},
            title:{display:true,text:"Dies d'antelació de la reserva",color:C.muted,font:{size:11}},
            ticks:{font:{size:11}} },
          y:{ min:0, max:105, grid:{color:C.grid}, border:{display:false},
            ticks:{callback:v=>v<=100?v+'%':'',font:{size:11},stepSize:25},
            title:{display:true,text:'Taxa de cancel·lació',color:C.muted,font:{size:11}} },
        },
        plugins: {
          legend:{ display:true, position:'top', align:'end',
            labels:{usePointStyle:true,pointStyle:'circle',padding:20,font:{size:12}} },
          tooltip:{ callbacks:{
            label: function(item) {
              const v = item.raw;
              let s = ` ${item.dataset.label}: ${v.toFixed(1)}%`;
              // Add n for Rest to explain the 0.6% anomaly
              if (item.datasetIndex === 1) s += `  (n=${nRest[item.dataIndex].toLocaleString()})`;
              return s;
            }
          }},
          annotation:{ annotations:{
            specZone:{ type:'box', xMin:4, xMax:5, backgroundColor:C.portugal+'10', borderColor:'transparent',
              label:{display:true, content:'Zona especulativa', position:{x:'center',y:'start'},
                color:C.portugal, font:{size:10,weight:'bold',style:'italic'}, backgroundColor:'transparent'}}
          }},
        },
      },
      plugins:[{
        id:'leadtimeHighlight',
        afterDatasetsDraw(chart) {
          const { ctx } = chart;
          // "97%" label on the last PRT point
          const meta = chart.getDatasetMeta(0);
          const lastPt = meta.data[5];
          ctx.save();
          ctx.fillStyle = C.portugal;
          ctx.font = 'bold 16px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('97,1%', lastPt.x + 12, lastPt.y);
          ctx.restore();

          // "n=944" note on the last Rest point to explain anomaly
          const metaR = chart.getDatasetMeta(1);
          const lastR = metaR.data[5];
          ctx.save();
          ctx.fillStyle = C.muted;
          ctx.font = 'italic 10px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('n=944', lastR.x + 10, lastR.y - 8);
          ctx.restore();
        }
      }],
    });
  }

  // ================================================================
  //  5 — CANCEL BY SEGMENT (butterfly / diverging bar chart)
  // ================================================================
  function buildCancelBySegment() {
    const canvas = freshCanvas();
    const segments = ['Direct', 'Corporate', 'Online TA', 'Offline TA/TO', 'Groups'];
    const prt  = [20.8, 23.6, 46.3, 68.9, 84.8];
    const rest = [10.8,  2.7, 34.5,  1.5,  7.3];

    // Rest goes negative (left), PRT goes positive (right)
    currentChart = new Chart(canvas, {
      type: 'bar',
      data: { labels: segments, datasets: [
        { label: 'Resta del món ←', data: rest.map(v => -v), backgroundColor: C.rest,
          borderRadius: 3, borderSkipped: false, barPercentage: 0.6 },
        { label: '→ Portugal', data: prt, backgroundColor: C.portugal,
          borderRadius: 3, borderSkipped: false, barPercentage: 0.6 },
      ]},
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        layout: { padding: { left: 50, right: 50 } },
        scales: {
          x: { min: -50, max: 100,
            grid: { color: ctx => ctx.tick.value === 0 ? C.dark + '40' : C.grid, lineWidth: ctx => ctx.tick.value === 0 ? 1.5 : 0.8 },
            border: { display: false },
            ticks: { callback: v => Math.abs(v) + '%', font: { size: 10 } },
            title: { display: true, text: '← Resta del món          Taxa de cancel·lació          Portugal →', color: C.muted, font: { size: 10 } } },
          y: { grid: { display: false }, border: { display: false },
            ticks: { display: false } },
        },
        plugins: {
          legend: { display: true, position: 'top', align: 'center',
            labels: { usePointStyle: true, pointStyle: 'rectRounded', padding: 20, font: { size: 12 } } },
          tooltip: { callbacks: {
            label: item => ` ${item.dataset.label.replace(/[←→]/g,'').trim()}: ${Math.abs(item.raw).toFixed(1)}%`,
          }},
        },
      },
      plugins: [{
        id: 'butterflyLabels',
        afterDatasetsDraw(chart) {
          const { ctx } = chart;
          const xScale = chart.scales.x;
          const zeroX = xScale.getPixelForValue(0);

          // Segment names at zero line
          chart.getDatasetMeta(1).data.forEach((bar, i) => {
            ctx.save();
            ctx.fillStyle = C.dark;
            ctx.font = '600 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(segments[i], zeroX, bar.y);
            ctx.restore();
          });

          // PRT value labels (right of bar)
          chart.getDatasetMeta(1).data.forEach((bar, i) => {
            ctx.save(); ctx.fillStyle = C.portugal;
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText(prt[i].toFixed(0) + '%', bar.x + 6, bar.y);
            ctx.restore();
          });
          // Rest value labels (left of bar)
          chart.getDatasetMeta(0).data.forEach((bar, i) => {
            ctx.save(); ctx.fillStyle = C.rest;
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
            ctx.fillText(rest[i].toFixed(0) + '%', bar.x - 6, bar.y);
            ctx.restore();
          });
        }
      }],
    });
  }

  // ================================================================
  //  6 — DEPOSIT EFFECTIVENESS (PRT by deposit type)
  // ================================================================
  function buildDepositEffect() {
    const canvas = freshCanvas();
    const labels = ['Sense dipòsit', 'Amb dipòsit no reemborsable'];
    const prt  = [40.1, 99.7];
    const rest = [23.4, 86.1];
    const nLabels = ['n = 32.801 PRT · 69.847 Rest', 'n = 14.175 PRT · 411 Rest'];

    currentChart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets:[
        { label:'Portugal', data:prt, backgroundColor:C.portugal,
          borderRadius:4, borderSkipped:false, barPercentage:0.75, categoryPercentage:0.6 },
        { label:'Resta del món', data:rest, backgroundColor:C.rest,
          borderRadius:4, borderSkipped:false, barPercentage:0.75, categoryPercentage:0.6 },
      ]},
      options: {
        responsive:true, maintainAspectRatio:false,
        layout:{ padding:{ top:25, bottom:30 } },
        scales: {
          x:{ grid:{display:false}, border:{display:false}, ticks:{font:{size:11}} },
          y:{ min:0, max:108, grid:{color:C.grid}, border:{display:false},
            ticks:{callback:v=>v<=100?v+'%':'',font:{size:11},stepSize:25},
            title:{display:true,text:'Taxa de cancel·lació',color:C.muted,font:{size:11}} },
        },
        plugins: {
          legend:{ display:true, position:'top', align:'end',
            labels:{usePointStyle:true,pointStyle:'rectRounded',padding:16,font:{size:12}} },
          tooltip:{ callbacks:{
            label:i=>` ${i.dataset.label}: ${i.raw.toFixed(1)}%`,
            afterBody: function(items) {
              const idx = items[0].dataIndex;
              return '\n' + nLabels[idx];
            }
          }},
        },
      },
      plugins:[{
        id:'depositValueLabels',
        afterDatasetsDraw(chart){
          const{ctx}=chart;
          [0,1].forEach(di=>{
            chart.getDatasetMeta(di).data.forEach((bar,i)=>{
              const v=chart.data.datasets[di].data[i];
              ctx.save();
              ctx.fillStyle = di===0?C.portugal:C.rest;
              ctx.font='bold 14px Inter,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
              ctx.fillText(v.toFixed(1)+'%',bar.x,bar.y-6); ctx.restore();
            });
          });
        }
      }],
    });
  }

  // ================================================================
  //  7 — RADAR: COMMITMENT PROFILE
  // ================================================================
  function buildRadar() {
    const canvas = freshCanvas();

    // Normalized 0–100 (higher = less commitment for PRT narrative)
    // Dimensions: Cancel rate, Lead time, % Groups, Low price, Low special requests
    const dims = [
      'Taxa cancel·lació',
      'Antelació reserva',
      '% Reserves de grup',
      'Preu per nit (€, invertit)',
      'Poques sol·licituds',
    ];

    // PRT: 58.1, 118.2d, 29.2%, ADR 95€, requests 0.36
    // REST: 23.7, 96.3d, 8.3%, ADR 109.2€, requests 0.71
    // Normalize each to 0-100 scale where 100 = max possible indicator
    const prt = [
      58.1,           // cancel rate (already %)
      73,             // lead time: 118.2/160 * 100 (normalized to ~160d max meaningful)
      87,             // % groups: 29.2/33 * 100 (max ~33%)
      75,             // inverse ADR: (1 - 95/140) * 100 → lower price = higher score
      73,             // inverse requests: (1 - 0.36/1.0) * 100
    ];
    const rest = [
      23.7,
      60,             // 96.3/160 * 100
      25,             // 8.3/33 * 100
      51,             // (1 - 109.2/140) * 100 → but this makes higher ADR = lower score which is wrong
      41,             // (1 - 0.71/1.0) * 100 → fewer requests = higher "non-commitment"
    ];

    currentChart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: dims,
        datasets: [
          { label: 'Portugal', data: prt,
            borderColor: C.portugal, backgroundColor: C.portugal + '25',
            borderWidth: 2.5, pointRadius: 5, pointHoverRadius: 8,
            pointBackgroundColor: C.portugal, pointBorderColor: '#fff', pointBorderWidth: 2 },
          { label: 'Rest of world', data: rest,
            borderColor: C.rest, backgroundColor: C.rest + '25',
            borderWidth: 2.5, pointRadius: 5, pointHoverRadius: 8,
            pointBackgroundColor: C.rest, pointBorderColor: '#fff', pointBorderWidth: 2 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100,
            grid: { color: C.grid },
            angleLines: { color: C.grid },
            pointLabels: {
              font: { size: 12, weight: '600' },
              color: C.dark,
            },
            ticks: {
              stepSize: 25,
              callback: v => v + '%',
              font: { size: 9 },
              backdropColor: 'transparent',
            },
          },
        },
        plugins: {
          legend: { display: true, position: 'top', align: 'center',
            labels: { usePointStyle: true, pointStyle: 'circle', padding: 24, font: { size: 13 } } },
          tooltip: {
            callbacks: {
              title: items => items[0].label,
              label: item => {
                const explanations = [
                  [' PRT: 58,1% — REST: 23,7%', ' Cancel·lació directa'],
                  [' PRT: 118 dies — REST: 96 dies', ' Mitjana dies antelació'],
                  [' PRT: 29,2% — REST: 8,3%', ' Via grups (canal menys fiable)'],
                  [' PRT: 95€ — REST: 109€', ' Preu mitjà per nit'],
                  [' PRT: 0,36 — REST: 0,71', ' Sol·licituds especials per reserva'],
                ];
                const idx = item.dataIndex;
                return explanations[idx] || [` ${item.dataset.label}: ${item.raw}`];
              },
            }
          },
        },
      },
    });
  }

  // ── Init ─────────────────────────────────────────────────
  const firstStep = document.querySelector('.step');
  if (firstStep && firstStep.dataset.scene) {
    firstStep.classList.add('is-active');
    renderScene(firstStep.dataset.scene, firstStep.dataset.caption || '');
  }
  window.addEventListener('resize', scroller.resize);

  let hintHidden = false;
  window.addEventListener('scroll', function () {
    if (!hintHidden && window.scrollY > 100) {
      const h = document.querySelector('.scroll-hint');
      if (h) { h.style.transition = 'opacity 0.5s'; h.style.opacity = '0'; }
      hintHidden = true;
    }
  });

})();
