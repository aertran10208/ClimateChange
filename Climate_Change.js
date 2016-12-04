var margin = {top: 10, right: 190, bottom: 25, left: 190},
    width = 1100 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("#mygraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");      

var tooltip = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

/***************xScales***************/

var xScale1 = d3.scale.linear()
    .range([0,width]);

var xScale2 = d3.scale.linear()
    .range([0,width]);

var xScale3 = d3.scale.linear()
    .range([0,width]);

var xScale4 = d3.scale.linear()
    .range([0,width]);

/***************yScales***************/

var yScale1 = d3.scale.linear()
    .range([height,0]);

var yScale2 = d3.scale.linear()
    .range([height,0]);

var yScale3 = d3.scale.linear()
    .range([height,0]);

var yScale4 = d3.scale.linear()
    .range([height,0]);

/***************xAxes***************/

var xAxis1 = d3.svg.axis()
    .scale(xScale1)
    .orient("bottom")
    .tickFormat(d3.format("d"));

var xAxis2 = d3.svg.axis()
    .scale(xScale2)
    .orient("bottom");

var xAxis3 = d3.svg.axis()
    .scale(xScale3)
    .orient("bottom");

var xAxis4 = d3.svg.axis()
    .scale(xScale4)
    .orient("bottom");

/***************yAxes***************/

var yAxis1 = d3.svg.axis()
    .scale(yScale1)
    .orient("left");

var yAxis2 = d3.svg.axis()
    .scale(yScale2)
    .orient("left");

var yAxis3 = d3.svg.axis()
    .scale(yScale3)
    .orient("left")
    .tickSize(-6);

var yAxis4 = d3.svg.axis()
    .scale(yScale4)
    .orient("left")
    .tickSize(-6);

/***************Line Functions***************/

var line1 = d3.svg.line()
    .x( function(d) { 
        return xScale1(d.Sea_Date); 
    })
    .y( function(d) { 
        return yScale1(d.GMSL); 
    });

var line2 = d3.svg.line()
    .x( function(d) { 
        return xScale2(d.Temp_Year); 
    })
    .y( function(d) { 
        return yScale2(d.Annual_5_Year_Mean); 
    });

var line3 = d3.svg.line()
    .x( function(d) { 
        return xScale3(d.CO2_Year); 
    })
    .y( function(d) { 
        return yScale3(d.Mean); 
    });

var line4 = d3.svg.line()
    .x( function(d) { 
        return xScale4(d.Sea_Ice_Year); 
    })
    .y( function(d) { 
        return yScale4(d.size); 
    });

/***************Intialize Variables***************/

var dataset1, dataset2, dataset3, dateset4;
var red = "#e41a1c", blue = "#377eb8", yellow = "#FFAC00", green = "#4daf4a", gray = "#D3D3D3";
var tempRed = "#e41a1c", tempBlue = "#377eb8", tempYellow = "#FFAC00", tempGreen = "#4daf4a";
var focus = svg.append("g").style("display", "none");
var bisectDate1 = d3.bisector(function(d) { return d.Sea_Date; }).left;
var bisectDate2 = d3.bisector(function(d) { return d.Temp_Year; }).left;
var bisectDate3 = d3.bisector(function(d) { return d.CO2_Year; }).left;
var bisectDate4 = d3.bisector(function(d) { return d.Sea_Ice_Year; }).left;
var onRedPath = false, onBluePath = false, onYellowPath = false, onGreenPath = false;
var onRedZoom = false, onBlueZoom = false, onYellowZoom = false, onGreenZoom = false;
var onRedTitle = false, onBlueTitle = false, onYellowTitle = false, onGreenTitle = false;
var redGrayed = false, blueGrayed = false, yellowGrayed = false, greenGrayed = false;
var isolateOn = false;
var isolateCounter = 0;
var displayFullCounter = 0;
var zoomToggled = false;
var displayMore = false;
var redrawCounter = 0, grayOut = false;

/***************Read in Data***************/
d3.csv("CSIRO_Recons_gmsl_mo_2015.csv", function(error1, data1){

    if (error1) throw error1;     

    dataset1 = data1;

    dataset1.forEach( function(d) {
        d.Sea_Date = +d.Sea_Date - 0.5;
        d.GMSL = +d.GMSL;
    });

    xScale1.domain([1979,2015]);
    yScale1.domain([-22.5,76.1]);
    
    dataPrint1();
    
    $("#separate_lines").on("click", function (e) {
        zoomOut();
        zoomToggled = true;
    });
    $("#overlap_lines").on("click", function (e) {
        zoomReset();
        zoomToggled = false;
    });
    $("#1880_2015").on("click", function (e) {
        displayMore = true;
        displayFullData();
    });
    $("#1980_2015").on("click", function (e) {
        displayMore = false;
        displayFullData();
    });
});

d3.csv("ANNUAL_GLOBAL_TEMP.csv", function(error2, data2){

    if (error2) throw error2;

    dataset2 = data2;

    dataset2.forEach( function(d) {
        d.Temp_Year = +d.Temp_Year;
        d.Annual_5_Year_Mean = +d.Annual_5_Year_Mean;
    });

    xScale2.domain([1979,2015]);
    yScale2.domain([0.18,0.7]);
    dataPrint2();
});

d3.csv("ANNUAL_CO2_EMISSION.csv", function(error3, data3){

    if (error3) throw error3;

    dataset3 = data3;

    dataset3.forEach( function(d) {
        d.CO2_Year = +d.CO2_Year;
        d.Mean = +d.Mean;
    });

    xScale3.domain([1979,2015]);
    yScale3.domain(d3.extent(dataset3, function(d) { return d.Mean;}));
    dataPrint3();
});

d3.csv("ARTIC_SEA_ICE_MIN.csv", function(error4, data4){

    if (error4) throw error4;

    dataset4 = data4;

    dataset4.forEach( function(d) {
        d.Sea_Ice_Year = +d.Sea_Ice_Year;
        d.size = +d.size;
    });

    xScale4.domain([1979,2015]);
    yScale4.domain((d3.extent(dataset4, function(d) { return d.size;})).reverse() );
    dataPrint4();
});

svg.append("clipPath")
        .attr("id", "clipLine")
        .append("rect")
        .attr("height", height)
        .attr("width", width)
        .style("opacity",1);

/***************Functions to print/draw the data***************/

function dataPrint1() {
    
    svg.append("path")
        .datum(dataset1)
        .attr("id","redLine")
        .attr("class", "line")
        .style("stroke", red)
        .style("opacity", 0)
        .attr("d", line1)
        .attr("clip-path", "url(#clipLine)")
        .transition()
        .duration(500)
        .style("opacity", 1);

    //Area to capture tooltip
    svg.selectAll("dot")
        .data(dataset1)
        .enter().append("circle")
        .attr("id", "redCircle")
        .style("opacity", 0)
        .attr("r", 10)
        .attr("cx", function(d) { return xScale1(d.Sea_Date); })
        .attr("cy", function(d) { return yScale1(d.GMSL); })
        .style("pointer-events", "painted")
        .on("mouseover", function(d) { focus.style("display", null);
                                        onRedPath = true;
                                        t = d.Sea_Date;
                                        v = d.GMSL;
                                        c = this;
                                        showTooltip(t,v,c);
                                     })
        .on("mouseout", function() { focus.style("display", "none");
                                        onRedPath = false;
                                        hideTooltip();
                                   })
        .on("mousemove", mousemove);

    //Draw y axis
    svg.append("g")
        .attr("class", "axisRed")
        .attr("transform", "translate(-20,0)")
        .style("opacity", 0)
        .style("fill", red)
        .call(yAxis1)
        .transition()
        .duration(500)
        .style("opacity", 1);
    
    svg.append("text")
        .attr("id", "textRed")
        .style("fill", red)
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("dy", -60)
        .style("text-anchor", "middle")
        .style("opacity", 0)
        .text("Global Mean Seal Level (mm)")
        .transition()
        .duration(500)
        .style("opacity", 1);

    //Draw x axis
    if (isolateCounter == 0) {
        svg.append("g")
        .attr("class", "axis")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis1);
    };
    
    svg.append("rect")
        .attr("id", "redRect")
        .attr("x", -75)
        .attr("y", 160)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("height", 250)
        .attr("width", "20px")
        .style("stroke", red)
        .style("fill", "#ffffff")
        .style("fill-opacity", "0")
        .style("opacity", 0)
        .on("mouseover", function() { 
            svg.select("#redRect")
                .style("stroke-width","5px"); 
            onRedTitle = true;
            }
        )
        .on("mouseout", function() { 
            svg.select("#redRect")
                .style("stroke-width","1px");
            onRedTitle = false;
            }
        )
        .on("click", function() {
            if(redGrayed == false){
                redrawGraph();
                removeRed();
                dataPrint1();
                svg.selectAll("#redLine")
                    .style("stroke-width", redrawCounter%2!=0 ? "3px" : "1.5px");
            };
            }
        )
        .transition()
        .duration(500)
        .style("opacity", 1);
};

//////////////////////////////////////////////////////////////////////////////////

function dataPrint2() {

    svg.append("path")
        .datum(dataset2)
        .attr("id","blueLine")
        .attr("class", "line")
        .style("stroke", blue)
        .style("opacity", 0)
        .attr("d", line2)
        .attr("clip-path", "url(#clipLine)")
        .transition()
        .duration(500)
        .style("opacity", 1);

    //Area to capture tooltip
    svg.selectAll("dot")
        .data(dataset2)
        .enter().append("circle")
        .attr("id", "blueCircle")
        .style("opacity", 0)
        .attr("r", 10)
        .attr("cx", function(d) { return xScale2(d.Temp_Year); })
        .attr("cy", function(d) { return yScale2(d.Annual_5_Year_Mean); })
        .style("pointer-events", "painted")
        .on("mouseover", function(d) { focus.style("display", null);
                                        onBluePath = true;
                                        t = d.Temp_Year;
                                        v = d.Annual_5_Year_Mean;
                                        c = this;
                                        showTooltip(t,v,c);
                                     })
        .on("mouseout", function() { focus.style("display", "none");
                                        onBluePath = false;
                                        hideTooltip();
                                   })
        .on("mousemove", mousemove);

    svg.append("g")
        .attr("class", "axisBlue")
        .attr("transform", "translate(-90,0)")
        .style("opacity", 0)
        .style("fill", blue)
        .call(yAxis2)
        .transition()
        .duration(500)
        .style("opacity", 1);
    
    svg.append("text")
        .attr("id", "textBlue")
        .style("fill", blue)
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("dy", -140)
        .style("text-anchor", "middle")
        .style("opacity", 0)
        .text("Global Annual Temp. Mean (C)")
        .transition()
        .duration(500)
        .style("opacity", 1);
    
    svg.append("rect")
        .attr("id", "blueRect")
        .attr("x", -155)
        .attr("y", 160)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("height", 250)
        .attr("width", "20px")
        .style("stroke", blue)
        .style("fill", "#ffffff")
        .style("fill-opacity", "0")
        .style("opacity",0)
        .on("mouseover", function() {
            svg.select("#blueRect")
                .style("stroke-width","5px");
            onBlueTitle = true;
            }
        )
        .on("mouseout", function() {
            svg.select("#blueRect")
                .style("stroke-width","1px");
            onBlueTitle = false;
            }
        )
        .on("click", function() {
            if(blueGrayed == false){
                redrawGraph();
                removeBlue();
                dataPrint2();
                moveBlue();
                svg.selectAll("#blueLine")
                    .style("stroke-width", redrawCounter%2!=0 ? "3px" : "1.5px");
            };
            }
        )
        .transition()
        .duration(500)
        .style("opacity",1);
};

//////////////////////////////////////////////////////////////////////////////////

function dataPrint3() {

    svg.append("path")
    .datum(dataset3)
    .attr("id", "yellowLine")
    .attr("class", "line")
    .style("stroke", yellow)
    .style("opacity", 0)
    .attr("d", line3)
    .transition()
    .duration(500)
    .style("opacity", 1);

    //Area to capture tooltip
    svg.selectAll("dot")
        .data(dataset3)
        .enter().append("circle")
        .attr("id", "yellowCircle")
        .style("opacity", 0)
        .attr("r", 10)
        .attr("cx", function(d) { return xScale3(d.CO2_Year); })
        .attr("cy", function(d) { return yScale3(d.Mean); })
        .style("pointer-events", "painted")
        .on("mouseover", function(d) { focus.style("display", null);
                                        onYellowPath = true;
                                        t = d.CO2_Year;
                                        v = d.Mean;
                                        c = this;
                                        showTooltip(t,v,c);
                                     })
        .on("mouseout", function() { focus.style("display", "none");
                                        onYellowPath = false;
                                        hideTooltip();
                                   })
        .on("mousemove", mousemove);

    svg.append("g")
        .attr("class", "axisYellow")
        .attr("transform", "translate(740,0)")
        .style("opacity", 0)
        .style("fill", yellow)
        .call(yAxis3)
        .transition()
        .duration(500)
        .style("opacity", 1)
        .selectAll("text")
        .attr("dx", "2.6em");

    svg.append("g")
        .append("text")
        .attr("id", "textYellow")
        .style("fill", yellow)
        .attr("x", height/2)
        .attr("dy", -790)
        .attr("transform", "rotate(90)")
        .style("text-anchor", "middle")
        .style("opacity", 0)
        .text("Annual Mean CO2 Emission (ppm)")
        .transition()
        .duration(500)
        .style("opacity", 1);
    
    svg.append("rect")
        .attr("id", "yellowRect")
        .attr("x", 785)
        .attr("y", 160)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("height", 250)
        .attr("width", "20px")
        .style("stroke", yellow)
        .style("fill", "#ffffff")
        .style("fill-opacity", "0")
        .on("mouseover", function() {
            svg.select("#yellowRect")
                .style("stroke-width","5px");
            onYellowTitle = true;
            }
        )
        .on("mouseout", function() {
            svg.select("#yellowRect")
                .style("stroke-width","1px");
            onYellowTitle = false;
            }
        )
        .on("click", function() {
            if(yellowGrayed == false){
                redrawGraph();
                removeYellow();
                dataPrint3();
                svg.selectAll("#yellowLine")
                    .style("stroke-width", redrawCounter%2!=0 ? "3px" : "1.5px");
            };
            }
        );
};

//////////////////////////////////////////////////////////////////////////////////

function dataPrint4() {

    svg.append("path")
    .datum(dataset4)
    .attr("id","greenLine")
    .attr("class", "line")
    .style("stroke", green)
    .style("opacity", 0)
    .attr("d", line4)
    .transition()
    .duration(500)
    .style("opacity", 1);

    //Area to capture tooltip
    svg.selectAll("dot")
        .data(dataset4)
        .enter().append("circle")
        .attr("id", "greenCircle")
        .style("opacity", 0)
        .attr("r", 10)
        .attr("cx", function(d) { return xScale4(d.Sea_Ice_Year); })
        .attr("cy", function(d) { return yScale4(d.size); })
        .style("pointer-events", "painted")
        .on("mouseover", function(d) { focus.style("display", null);
                                        onGreenPath = true;
                                        t = d.Sea_Ice_Year;
                                        v = d.size;
                                        c = this;
                                        showTooltip(t,v,c);
                                     })
        .on("mouseout", function() { focus.style("display", "none");
                                        onGreenPath = false;
                                        hideTooltip();
                                   })
        .on("mousemove", mousemove);

    svg.append("g")
        .attr("class", "axisGreen")
        .style("opacity", 0)
        .attr("transform", "translate(820,0)")
        .style("fill", green)
        .call(yAxis4)
        .transition()
        .duration(500)
        .style("opacity", 1)
        .selectAll("text")
        .attr("dx", "2.4em");

    svg.append("g")
        .append("text")
        .attr("id", "textGreen")
        .style("fill", green)
        .attr("transform", "rotate(90)")
        .attr("x", height/2)
        .attr("dy", -870)
        .style("text-anchor", "middle")
        .style("opacity", 0)
        .text("Artic Sea Ice Minimum (M sq. km)")
        .transition()
        .duration(500)
        .style("opacity", 1);
    
    svg.append("rect")
        .attr("id", "greenRect")
        .attr("x", 865)
        .attr("y", 160)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("height", 250)
        .attr("width", "20px")
        .style("stroke", green)
        .style("fill", "#ffffff")
        .style("fill-opacity", "0")
        .on("mouseover", function() {
            svg.select("#greenRect")
                .style("stroke-width","5px");
            onGreenTitle = true;
            }
        )
        .on("mouseout", function() {
            svg.select("#greenRect")
                    .style("stroke-width","1px");
            onGreenTitle = false;
            }
        )
        .on("click", function() {
            if(greenGrayed == false){
                redrawGraph();
                removeGreen();
                dataPrint4();
                moveGreen();
                svg.selectAll("#greenLine")
                    .style("stroke-width", redrawCounter%2!=0 ? "3px" : "1.5px");
            };
            }
        );
};

/***************Initialize circle and dashed line to isolate a data point***************/

//apend circle at the intersection
focus.append("circle")
    .attr("class", "y")
    .style("fill", "none")
    .style("stroke", red)
    .attr("r", 4);

// append the x line
focus.append("line")
    .attr("class", "x")
    .style("stroke", red)
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("y1", 0)
    .attr("y2", height);

// append the y line
focus.append("line")
    .attr("class", "y")
    .style("stroke", red)
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("x1", 0)
    .attr("x2", width);

/***************Tooltip Logic***************/

// update tooltip position
function mousemove() {

    if (onRedPath) {

        var x0 = xScale1.invert(d3.mouse(this)[0]),
            i = bisectDate1(dataset1, x0, 1),
            d0 = dataset1[i - 1],
            d1 = dataset1[i],
            d = ((x0 - d0.Sea_Date) > (d1.Sea_Date - x0)) ? d1 : d0;

        focus.select("circle")
            .style("stroke", red)
        focus.selectAll("line")
            .style("stroke", red);

        focus.select("circle.y")
            .attr("transform",
                  "translate(" + xScale1(d.Sea_Date) + "," +
                                yScale1(d.GMSL) + ")");
        focus.select("line.y")
            .attr("transform",
                  "translate(" + xScale1(d.Sea_Date) + "," +
                                yScale1(d.GMSL) + ")")
                        .attr("x2", width*-2);

        focus.select("line.x")
            .attr("transform",
                  "translate(" + xScale1(d.Sea_Date) + "," +
                                yScale1(d.GMSL) + ")")
                          .attr("y2", height - yScale1(d.GMSL));

    } else if (onBluePath) {

        var x0 = xScale2.invert(d3.mouse(this)[0]),
            i = bisectDate2(dataset2, x0, 1),
            d0 = dataset2[i - 1],
            d1 = dataset2[i],
            d = ((x0 - d0.Temp_Year) > (d1.Temp_Year - x0)) ? d1 : d0;

        focus.select("circle")
            .style("stroke", blue)
        focus.selectAll("line")
            .style("stroke", blue);

        focus.select("circle.y")
            .attr("transform",
                  "translate(" + xScale2(d.Temp_Year) + "," +
                                yScale2(d.Annual_5_Year_Mean) + ")");
        focus.select("line.y")
            .attr("transform",
                  "translate(" + xScale2(d.Temp_Year) + "," +
                                yScale2(d.Annual_5_Year_Mean) + ")")
                        .attr("x2", width*-2);

        focus.select("line.x")
            .attr("transform",
                  "translate(" + xScale2(d.Temp_Year) + "," +
                                yScale2(d.Annual_5_Year_Mean) + ")")
                          .attr("y2", height - yScale2(d.Annual_5_Year_Mean));
    } else if (onYellowPath) {

        var x0 = xScale3.invert(d3.mouse(this)[0]),
            i = bisectDate3(dataset3, x0, 1),
            d0 = dataset3[i - 1],
            d1 = dataset3[i],
            d = ((x0 - d0.CO2_Year) > (d1.CO2_Year - x0)) ? d1 : d0;

        focus.select("circle")
            .style("stroke", yellow)
        focus.selectAll("line")
            .style("stroke", yellow);

        focus.select("circle.y")
            .attr("transform",
                  "translate(" + xScale3(d.CO2_Year) + "," +
                                yScale3(d.Mean) + ")");
        focus.select("line.y")
            .attr("transform",
                  "translate(" + xScale3(d.CO2_Year) + "," +
                                yScale3(d.Mean) + ")")
                        .attr("x2", width + width);

        focus.select("line.x")
            .attr("transform",
                  "translate(" + xScale3(d.CO2_Year) + "," +
                                yScale3(d.Mean) + ")")
                          .attr("y2", height - yScale3(d.Mean));
    } else if (onGreenPath) {

        var x0 = xScale4.invert(d3.mouse(this)[0]),
            i = bisectDate4(dataset4, x0, 1),
            d0 = dataset4[i - 1],
            d1 = dataset4[i],
            d = ((x0 - d0.Sea_Ice_Year) > (d1.Sea_Ice_Year - x0)) ? d1 : d0;

        focus.select("circle")
            .style("stroke", green)
        focus.selectAll("line")
            .style("stroke", green);

        focus.select("circle.y")
            .attr("transform",
                  "translate(" + xScale4(d.Sea_Ice_Year) + "," +
                                yScale4(d.size) + ")");
        focus.select("line.y")
            .attr("transform",
                  "translate(" + xScale4(d.Sea_Ice_Year) + "," +
                                yScale4(d.size) + ")")
                        .attr("x2", width + width);

        focus.select("line.x")
            .attr("transform",
                  "translate(" + xScale4(d.Sea_Ice_Year) + "," +
                                yScale4(d.size) + ")")
                          .attr("y2", height - yScale4(d.size));
    };


};

//Display Tooltip
function showTooltip(t,v,c){
    
    var h = -90;
    var w = -100;
    
    var matrix = c.getScreenCTM()
        .translate(+c.getAttribute("cx"),+c.getAttribute("cy"));
        tooltip.transition().duration(200).style("opacity", 0.9); 
    
    if(onRedPath){
        tooltip.html("Year " + t + "<br /><br />" + "Global Mean Sea Level" + "<br />" + v + "mm")  
            .style("left", window.pageXOffset + matrix.e + w + "px")     
            .style("top", window.pageYOffset + matrix.f + h + "px");
    } else if (onBluePath) {
        tooltip.html("Year " + t + "<br /><br />" + "Global Annual Temp. Mean" + "<br />" + v + "&deg;C")  
            .style("left", window.pageXOffset + matrix.e + w + "px")     
            .style("top", window.pageYOffset + matrix.f + h +"px");
    } else if (onYellowPath) {
        tooltip.html("Year " + t + "<br /><br />" + "Global Annual C0<sub>2</sub> Emiss. Mean" + "<br />" + v + "ppm")  
            .style("left", window.pageXOffset + matrix.e + w + "px")     
            .style("top", window.pageYOffset + matrix.f + h + "px");
    } else if (onGreenPath) {
        tooltip.html("Year " + t + "<br /><br />" + "Artic Sea Ice Minimum" + "<br />" + v + "M sq. km")  
            .style("left", window.pageXOffset + matrix.e + w + "px")     
            .style("top", window.pageYOffset + matrix.f + h + "px");
    };
};

//Hide Tooltip
function hideTooltip(){
    tooltip.transition().duration(200).style("opacity", 0);
};


/***************Zoom Logic***************/

function zoomed1() {

    svg.select(".axisRed").transition().duration(1000).call(yAxis1);
    svg.select("#xAxis").transition().duration(1000).call(xAxis1);
    console.log("red " + yScale1.domain());
    svg.selectAll("#redLine")
        .datum(dataset1)
        .transition().duration(1000)
        .attr("d", line1);  
    svg.selectAll("#redCircle")
        .data(dataset1)
        .attr("cx", function(d) { return xScale1(d.Sea_Date); })
        .attr("cy", function(d) { return yScale1(d.GMSL); });

};

function zoomed2() {

    svg.select(".axisBlue").transition().duration(1000).call(yAxis2);
    svg.select(".x.axis").call(xAxis2);
    svg.selectAll("#blueLine")
        .datum(dataset2)
        .transition().duration(1000)
        .attr("d", line2);  
    svg.selectAll("#blueCircle")
        .data(dataset2)
        .attr("cx", function(d) { return xScale2(d.Temp_Year); })
        .attr("cy", function(d) { return yScale2(d.Annual_5_Year_Mean); });

};

function zoomed3() {

    svg.select(".axisYellow").transition().duration(1000).call(yAxis3);
    svg.select(".axisYellow").selectAll("text").attr("dx", "2.6em");
    svg.select(".x.axis").call(xAxis3);
    svg.selectAll("#yellowLine")
        .datum(dataset3)
        .transition().duration(1000)
        .attr("d", line3);
    svg.selectAll("#yellowCircle")
        .data(dataset3)
        .attr("cx", function(d) { return xScale3(d.CO2_Year); })
        .attr("cy", function(d) { return yScale3(d.Mean); });

};

function zoomed4() {

    svg.select(".axisGreen").transition().duration(1000).call(yAxis4);
    svg.select(".axisGreen").selectAll("text").attr("dx", "2.4em");
    svg.select(".x.axis").call(xAxis4);
    svg.selectAll("#greenLine")
        .datum(dataset4)
        .transition().duration(1000)
        .attr("d", line4);                          
    svg.selectAll("#greenCircle")
        .data(dataset4)
        .attr("cx", function(d) { return xScale4(d.Sea_Ice_Year); })
        .attr("cy", function(d) { return yScale4(d.size); });
};

/***************Zoom Out Logic***************/

function zoomOut() {
    
    svg.call(
        d3.behavior.zoom()
        .y(yScale1)
        .scaleExtent([1, 10])
        .on("zoom", zoomed1)
        .y(yScale1.domain( displayMore == false ? [-138.81745544323303,81.98254455676701] : [-370.5873381902873,82.45929302054348] ))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScale2)
        .scaleExtent([1, 10])
        .on("zoom", zoomed2)
        .y(yScale2.domain( displayMore == false ? [-0.12298306496912875,0.9170169350308713] : [-1.0490103069115129,1.3402822714823206] ))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScale3)
        .scaleExtent([1, 10])
        .on("zoom", zoomed3)
        .y(yScale3.domain( displayMore == false ? [318.22523749494553,431.00523749494556] : [250.8646806411217,529.3551098266029] ))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScale4)
        .scaleExtent([1, 10])
        .on("zoom", zoomed4)
        .y(yScale4.domain( displayMore == false ? [8.354811609268188,-0.20518839073181194] : [10.65405455025001,-9.011661287299242] ))
        .event);

};  

/***************Reset Zoom Logic***************/
function zoomReset() {

    svg.call(
        d3.behavior.zoom()
        .y(yScale1)
        .scaleExtent([1, 10])
        .on("zoom", zoomed1)
        .y(yScale1.domain( displayMore == false ? [-22.5,76.1] : d3.extent(dataset1, function(d) { return d.GMSL;}) ))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScale2)
        .scaleExtent([1, 10])
        .on("zoom", zoomed2)
        .y(yScale2.domain( displayMore == false ? [0.18,0.7] : d3.extent(dataset2, function(d) { return d.Annual_5_Year_Mean;}) ))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScale3)
        .scaleExtent([1, 10])
        .on("zoom", zoomed3)
        .y(yScale3.domain(d3.extent(dataset3, function(d) { return d.Mean;})))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScale4)
        .scaleExtent([1, 10])
        .on("zoom", zoomed4)
        .y(yScale4.domain( (d3.extent(dataset4, function(d) { return d.size;})).reverse() ))
        .event);
};

/***************Isolate Line Logic***************/

function removeRed(){
    svg.selectAll("#redLine")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll(".axisRed")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#textRed")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#redRect")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#redCircle")
        .remove();
};

function removeBlue(){
    svg.selectAll("#blueLine")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll(".axisBlue")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#textBlue")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#blueRect")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#blueCircle")
        .remove();
};

function removeYellow(){
    svg.selectAll("#yellowLine")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll(".axisYellow")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#textYellow")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#yellowRect")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#yellowCircle")
        .remove();
};

function removeGreen(){
    svg.selectAll("#greenLine")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll(".axisGreen")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#textGreen")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#greenRect")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
    svg.selectAll("#greenCircle")
        .remove();
};

function redrawGraph() {
    red = tempRed;
    blue = tempBlue;
    yellow = tempYellow;
    green = tempGreen;
    isolateCounter++;
    
    var styleElement = document.createElement("style");
        styleElement.type = "text/css"; 
        document.head.insertBefore(styleElement, null);  
        var styleSheet = styleElement.sheet;
        var ruleNum = styleSheet.cssRules.length;

    if (onRedTitle == false) { 
        removeRed();
        red = redrawCounter%2 == 0 ? gray : tempRed;
        styleSheet.insertRule(
            redrawCounter%2 == 0 ? ".axisRed line{stroke:#d3d3d3;}":
                ".axisRed line{stroke:#e41a1c;}" , 
            ruleNum);
        styleSheet.insertRule(
            redrawCounter%2 == 0 ? ".axisRed path{stroke:#d3d3d3;}":
                ".axisRed path{stroke:#e41a1c;}" , 
            ruleNum);
        dataPrint1();
    } else {
        redGrayed = false;
        blueGrayed = redrawCounter%2 == 0 ? true : false;
        yellowGrayed = redrawCounter%2 == 0 ? true : false;
        greenGrayed = redrawCounter%2 == 0 ? true : false;
    };

    if (onBlueTitle == false) { 
        removeBlue();
        blue = redrawCounter%2 == 0 ? gray : tempBlue;
        styleSheet.insertRule(
            redrawCounter%2 == 0 ? ".axisBlue line{stroke:#d3d3d3;}" :
                ".axisBlue line{stroke:#377eb8;}" , 
            ruleNum);
        styleSheet.insertRule(
            redrawCounter%2 == 0 ? ".axisBlue path{stroke:#d3d3d3;}" :
                ".axisBlue path{stroke:#377eb8;}" , 
            ruleNum);
        dataPrint2();
    } else {
        redGrayed = redrawCounter%2 == 0 ? true : false;
        blueGrayed = false;
        yellowGrayed = redrawCounter%2 == 0 ? true : false;
        greenGrayed = redrawCounter%2 == 0 ? true : false;
        console.log("Hi");
    };

    if (onYellowTitle == false) { 
        removeYellow();
        yellow = redrawCounter%2 == 0 ? gray : tempYellow;
        styleSheet.insertRule(
            redrawCounter%2 == 0 ? ".axisYellow line{stroke:#d3d3d3;}" :
                ".axisYellow line{stroke:#FFAC00;}" , 
            ruleNum);
        styleSheet.insertRule(
            redrawCounter%2 == 0 ? ".axisYellow path{stroke:#d3d3d3;}" :
                ".axisYellow path{stroke:#FFAC00;}" , 
            ruleNum);
        dataPrint3();
    } else {
        redGrayed = redrawCounter%2 == 0 ? true : false;
        blueGrayed = redrawCounter%2 == 0 ? true : false;
        yellowGrayed = false;
        greenGrayed = redrawCounter%2 == 0 ? true : false;
    };

    if (onGreenTitle == false) { 
        removeGreen();
        green = redrawCounter%2 == 0 ? gray : tempGreen;
        styleSheet.insertRule(
            redrawCounter%2 == 0 ? ".axisGreen path {stroke:#d3d3d3;}" :
                ".axisGreen path{stroke:#4daf4a;}" , 
            ruleNum);
        styleSheet.insertRule(
            redrawCounter%2 == 0 ? ".axisGreen line{stroke:#d3d3d3;}" :
                ".axisGreen line{stroke:#4daf4a;}" , 
            ruleNum);
        dataPrint4();
    } else {
        redGrayed = redrawCounter%2 == 0 ? true : false;
        blueGrayed = redrawCounter%2 == 0 ? true : false;
        yellowGrayed = redrawCounter%2 == 0 ? true : false;
        greenGrayed = false;
    };
    
    redrawCounter++;
}

function moveBlue() {
    svg.selectAll("#redRect")
        .attr("x", redrawCounter%2 != 0 ? -155 : -75);
    svg.selectAll("#textRed")
        .attr("dy", redrawCounter%2 != 0 ? -140 : -60);
    svg.selectAll(".axisRed")
        .attr("transform", "translate(" + (redrawCounter%2 != 0 ? "-100" : "-20") + ",0)" );

    svg.selectAll("#blueRect")
        .transition()
        .duration(500)
        .attr("x", redrawCounter%2 != 0 ? -85 : -155 );
    svg.selectAll("#textBlue")
        .transition()
        .duration(500)
        .attr("dy", redrawCounter%2 != 0 ? -70 : -140);
    svg.selectAll(".axisBlue")
        .transition()
        .duration(500)
        .attr("transform", "translate(" + (redrawCounter%2 != 0 ? "-20" : "-90") + ",0)" );
};

function moveGreen(){
    svg.selectAll("#yellowRect")
        .attr("x", redrawCounter%2 != 0 ? 865 : 785);
    svg.selectAll("#textYellow")
        .attr("dy", redrawCounter%2 != 0 ? -870 : -790);
    svg.selectAll(".axisYellow")
        .attr("transform", "translate(" + (redrawCounter%2 != 0 ? "820" : "740") + ",0)" );

    svg.selectAll("#greenRect")
        .transition()
        .duration(500)
        .attr("x", redrawCounter%2 != 0 ? 785 : 865 );
    svg.selectAll("#textGreen")
        .transition()
        .duration(500)
        .attr("dy", redrawCounter%2 != 0 ? -790 : -870);
    svg.selectAll(".axisGreen")
        .transition()
        .duration(500)
        .attr("transform", "translate(" + (redrawCounter%2 != 0 ? "740" : "820") + ",0)" );
};

function displayFullData() {

    svg.call(
        d3.behavior.zoom()
        .x(xScale1)
        .y(yScale1)
        .scaleExtent([1, 10])
        .on("zoom", zoomed1)
        .x(xScale1.domain([displayMore == true ? 1880 : 1979,2015]))
        .y(yScale1.domain((displayMore == true) ? (d3.extent(dataset1, function(d) { return d.GMSL;})) : [-22.5,76.1]))
        .event);
    
    svg.call(
        d3.behavior.zoom()
        .x(xScale2)
        .y(yScale2)
        .scaleExtent([1, 10])
        .on("zoom", zoomed2)
        .x(xScale2.domain([displayMore == true ? 1880 : 1979,2015]))
        .y(yScale2.domain((displayMore == true) ? (d3.extent(dataset2, function(d) { return d.Annual_5_Year_Mean;})) : [0.18,0.7]))
        .event);
    
    svg.call(
        d3.behavior.zoom()
        .x(xScale3)
        .scaleExtent([1, 10])
        .on("zoom", zoomed3)
        .x(xScale3.domain([displayMore == true ? 1880 : 1979,2015]))
        .event);
    
    svg.call(
        d3.behavior.zoom()
        .x(xScale4)
        .scaleExtent([1, 10])
        .on("zoom", zoomed4)
        .x(xScale4.domain([displayMore == true ? 1880 : 1979,2015]))
        .event);
    
    if(zoomToggled == true){
        zoomReset();
        zoomOut();
    };
};
