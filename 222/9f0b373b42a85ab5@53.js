function _chart(d3,width,height,bubbles,chartData,showLegend,bubbleColor,invertedColor,bubbleText,drawPie,pieColor,years)
{
  const svg = d3.create("svg")
    .attr("font-size", "9pt")    
    .style("cursor", "default")    
    .attr("viewBox", [0, 0, width, height]);
  
  const g = svg.selectAll("g")
    .data(bubbles(chartData).leaves())
    .join("g")
    .attr("opacity", 1)
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .on("mouseenter", e => {
      e.currentTarget.parentElement.appendChild(e.currentTarget);
      legend.node().parentElement.appendChild(legend.node());
    })
    .on("mouseover", (e, d) => {
      g.transition().duration(500).attr("opacity", a => a === d ? 1 : 0.3)
      g.selectAll(".ctext").transition().duration(500).attr("opacity", 0.5);      
      showLegend(legend, d);
    })
    .on("mouseout", () => { 
      g.transition().duration(500).attr("opacity", 1);
      g.selectAll(".ctext").transition().duration(500).attr("opacity", 1);      
      legend.attr("opacity", 0);
    });
  
  g.append("g")    
    .call(g => g.append("circle").attr("r", d => d.r).attr("fill", d => bubbleColor(d.value)))
    .call(g => g.append("g").attr("fill", d => invertedColor(d.value)).call(g => bubbleText(g, true, "ctext")));

  g.append("g")
    .attr("class", "pie")    
    .call(g => g.append("g")
            .attr("font-weight", "bold")
            .attr("transform", d => `translate(0,${d.r + 10})`)
            .call(bubbleText)
    )
    .selectAll("path")
    .data(d => d3.pie()(d.data.values).map(p => ({pie: p, data: d})))
    .join("path")
    .attr("d", drawPie)
    .attr("fill", (d, i) => pieColor(years[i]));
  
  const legend = svg.append("g").attr("font-weight", "bold").attr("opacity", 1);
  
  return svg.node();
}


function _bubbles(d3,width,height){return(
data => d3.pack()
  .size([width, height])
  .padding(3)(
    d3.hierarchy({children: data})
      .sum(d => d.total)
  )
)}

function _drawPie(d3){return(
d => d3.arc()
  .innerRadius(0)
  .outerRadius(d.data.r)
  .startAngle(d.pie.startAngle)
  .endAngle(d.pie.endAngle)()
)}

function _bubbleText(d3){return(
(g, short, className) => {
  g.append("text")
    .attr("class", className)
    .attr("text-anchor", "middle")
    .text(d => short ? d.data.code : d.data.name);
  
  g.append("text")
    .attr("class", className)
    .attr("text-anchor", "middle")
    .attr("dy", "1em")
    .text(d => short ? d3.format("$.2s")(d.value) : d.value);
}
)}

function _showLegend(years,pieColor){return(
(legend, d) => {
  legend.selectAll("g").remove();
  legend    
    .selectAll("g")
    .data(years)
    .join("g")
    .attr("transform", (d, i) => `translate(0,${15 * i})`)
    .call(g => g.append("rect")
      .attr("width", 15).attr("height", 12)
      .attr("rx", 3).attr("ry", 3) 
      .attr("fill", y => pieColor(y)))
    .call(g => g.append("text")
      .attr("dx", 20)
      .attr("dy", "0.8em")      
      .text((y, i) => {
        const v = d.data.values[i];
        return `${y} ${v} (${(v / d.value * 100).toFixed(1)}%)`
      }));  
  
    legend.attr("opacity", 1)
      .attr("transform", `translate(${d.x + d.r + 10},${d.y - d.r})`);
}
)}

function _pieColor(d3,years){return(
d3.scaleOrdinal()
  .domain(years)
  .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"])
)}

function _bubbleColor(d3,chartData){return(
d3.scaleSequential(d3.interpolateOrRd)
  .domain(d3.extent(chartData.map(d => d.total)))
)}

function _invertedColor(d3,chartData){return(
d3.scaleSequential(d3.interpolateCubehelixDefault)
  .domain(d3.extent(chartData.map(d => d.total)))
)}

async function _data(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("2.csv").text(), d3.autoType)
)}

function _years(data){return(
data.columns.slice(1,4)
)}

function _chartData(data,years){return(
data.map(d => {
  const values = years.map(y => d[y])
  return {
    name: d["name"],
    code: d["Code"],
    values: values,
    total: values.reduce((a, b) => a + b)
  }
})
)}

function _width(){return(
1024
)}

function _height(){return(
768
)}

function _d3(require){return(
require("d3@6")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["2.csv", {url: new URL("./files/9b931d0037a0ca15e8d82fd8515df09b6432887b0e0a7a3237e304fe5b7c9369659a978dbae9184a1b37bfd33a3ba4a1be1f95a84920a5e62880493dd366b986.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer("chart")).define("chart", ["d3","width","height","bubbles","chartData","showLegend","bubbleColor","invertedColor","bubbleText","drawPie","pieColor","years"], _chart);
  main.variable(observer("bubbles")).define("bubbles", ["d3","width","height"], _bubbles);
  main.variable(observer("drawPie")).define("drawPie", ["d3"], _drawPie);
  main.variable(observer("bubbleText")).define("bubbleText", ["d3"], _bubbleText);
  main.variable(observer("showLegend")).define("showLegend", ["years","pieColor"], _showLegend);
  main.variable(observer("pieColor")).define("pieColor", ["d3","years"], _pieColor);
  main.variable(observer("bubbleColor")).define("bubbleColor", ["d3","chartData"], _bubbleColor);
  main.variable(observer("invertedColor")).define("invertedColor", ["d3","chartData"], _invertedColor);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], _data);
  main.variable(observer("years")).define("years", ["data"], _years);
  main.variable(observer("chartData")).define("chartData", ["data","years"], _chartData);
  main.variable(observer("width")).define("width", _width);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
