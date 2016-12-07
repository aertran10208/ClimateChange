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

var xScaleRed = d3.scale.linear()
    .range([0,width]);

var xScaleBlue = d3.scale.linear()
    .range([0,width]);

var xScaleYellow = d3.scale.linear()
    .range([0,width]);

var xScaleGreen = d3.scale.linear()
    .range([0,width]);

/***************yScales***************/

var yScaleRed = d3.scale.linear()
    .range([height,0]);

var yScaleBlue = d3.scale.linear()
    .range([height,0]);

var yScaleYellow = d3.scale.linear()
    .range([height,0]);

var yScaleGreen = d3.scale.linear()
    .range([height,0]);

/***************xAxes***************/

var xAxisRed = d3.svg.axis()
    .scale(xScaleRed)
    .orient("bottom")
    .tickFormat(d3.format("d"));

var xAxisBlue = d3.svg.axis()
    .scale(xScaleBlue)
    .orient("bottom");

var xAxisYellow = d3.svg.axis()
    .scale(xScaleYellow)
    .orient("bottom");

var xAxisGreen = d3.svg.axis()
    .scale(xScaleGreen)
    .orient("bottom");

/***************yAxes***************/

var yAxisRed = d3.svg.axis()
    .scale(yScaleRed)
    .orient("left");

var yAxisBlue = d3.svg.axis()
    .scale(yScaleBlue)
    .orient("left");

var yAxisYellow = d3.svg.axis()
    .scale(yScaleYellow)
    .orient("left")
    .tickSize(-6);

var yAxisGreen = d3.svg.axis()
    .scale(yScaleGreen)
    .orient("left")
    .tickSize(-6);

/***************Line Functions***************/

var line1 = d3.svg.line()
    .x( function(d) { 
        return xScaleRed(d.Sea_Year); 
    })
    .y( function(d) { 
        return yScaleRed(d.GMSL); 
    });

var line2 = d3.svg.line()
    .x( function(d) { 
        return xScaleBlue(d.Temp_Year); 
    })
    .y( function(d) { 
        return yScaleBlue(d.Annual_5_Year_Mean); 
    });

var line3 = d3.svg.line()
    .x( function(d) { 
        return xScaleYellow(d.CO2_Year); 
    })
    .y( function(d) { 
        return yScaleYellow(d.Mean); 
    });

var line4 = d3.svg.line()
    .x( function(d) { 
        return xScaleGreen(d.Ice_Year); 
    })
    .y( function(d) { 
        return yScaleGreen(d.size); 
    });

//initialize the svg object to contain the cirlce and dashed line
var focus = svg.append("g").style("display", "none");
//bisect function (help determine which data point the cursor is closer to)
var bisectDate1 = d3.bisector(function(d) { return d.Sea_Year; }).left;
var bisectDate2 = d3.bisector(function(d) { return d.Temp_Year; }).left;
var bisectDate3 = d3.bisector(function(d) { return d.CO2_Year; }).left;
var bisectDate4 = d3.bisector(function(d) { return d.Ice_Year; }).left;

/***************Intialize Variables***************/

//initialize data variables
var seaData, tempData, carbData, iceData; 
//initialize and set colors
var red = "#e41a1c", blue = "#377eb8", yellow = "#FFAC00", green = "#4daf4a", gray = "#D3D3D3"; 
var tempRed = "#e41a1c", tempBlue = "#377eb8", tempYellow = "#FFAC00", tempGreen = "#4daf4a";
//initialize and set boolean variables for future logic 
var onRedPath = false, onBluePath = false, onYellowPath = false, onGreenPath = false;
var onRedZoom = false, onBlueZoom = false, onYellowZoom = false, onGreenZoom = false;
var onRedTitle = false, onBlueTitle = false, onYellowTitle = false, onGreenTitle = false;
var redGrayed = false, blueGrayed = false, yellowGrayed = false, greenGrayed = false;
var grayOut = false, zoomToggled = false, displayMore = false;
var isolateCounter = 0, displayFullCounter = 0, redrawCounter = 0; 

/***************Read in Data***************/
d3.csv("CSIRO_Recons_gmsl_mo_2015.csv", function(error1, data1){

    if (error1) throw error1;     

    seaData = data1;

    seaData.forEach( function(d) {
        d.Sea_Year = +d.Sea_Year - 0.5;
        d.GMSL = +d.GMSL;
    });

    xScaleRed.domain([1979,2015]);
    yScaleRed.domain([-22.5,76.1]);
    
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

    tempData = data2;

    tempData.forEach( function(d) {
        d.Temp_Year = +d.Temp_Year;
        d.Annual_5_Year_Mean = +d.Annual_5_Year_Mean;
    });

    xScaleBlue.domain([1979,2015]);
    yScaleBlue.domain([0.18,0.7]);
    dataPrint2();
});

d3.csv("ANNUAL_CO2_EMISSION.csv", function(error3, data3){

    if (error3) throw error3;

    carbData = data3;

    carbData.forEach( function(d) {
        d.CO2_Year = +d.CO2_Year;
        d.Mean = +d.Mean;
    });

    xScaleYellow.domain([1979,2015]);
    yScaleYellow.domain(d3.extent(carbData, function(d) { return d.Mean;}));
    dataPrint3();
});

d3.csv("ARTIC_SEA_ICE_MIN.csv", function(error4, data4){

    if (error4) throw error4;

    iceData = data4;

    iceData.forEach( function(d) {
        d.Ice_Year = +d.Ice_Year;
        d.size = +d.size;
    });

    xScaleGreen.domain([1979,2015]);
    yScaleGreen.domain((d3.extent(iceData, function(d) { return d.size;})).reverse() );
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
    
    //Create line
    svg.append("path")
        .datum(seaData)
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
        .data(seaData)
        .enter().append("circle")
        .attr("id", "redCircle")
        .style("opacity", 0)
        .attr("r", 10)
        .attr("cx", function(d) { return xScaleRed(d.Sea_Year); })
        .attr("cy", function(d) { return yScaleRed(d.GMSL); })
        .style("pointer-events", "painted")
        .on("mouseover", function(d) {  t = d.Sea_Year;
                                        v = d.GMSL;
                                        c = this;
                                        if (displayMore == false && t < 1979) {
                                            focus.style("display", "none");
                                            onRedPath = false;
                                        } else {
                                            focus.style("display", null);
                                            onRedPath = true;                                          
                                            showTooltip(t,v,c);
                                        };
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
        .call(yAxisRed)
        .transition()
        .duration(500)
        .style("opacity", 1);
    
    //Draw y label
    svg.append("text")
        .attr("id", "textRed")
        .style("fill", red)
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("dy", -65)
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
        .call(xAxisRed);
    };
    
    //Draw title box/button
    svg.append("rect")
        .attr("id", "redRect")
        .attr("x", -80)
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
    
    //Create line
    svg.append("path")
        .datum(tempData)
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
        .data(tempData)
        .enter().append("circle")
        .attr("id", "blueCircle")
        .style("opacity", 0)
        .attr("r", 10)
        .attr("cx", function(d) { return xScaleBlue(d.Temp_Year); })
        .attr("cy", function(d) { return yScaleBlue(d.Annual_5_Year_Mean); })
        .style("pointer-events", "painted")
        .on("mouseover", function(d) {  t = d.Temp_Year;
                                        v = d.Annual_5_Year_Mean;
                                        c = this;
                                        if (displayMore == false && t < 1979) {
                                            focus.style("display", "none");
                                            onBluePath = false;
                                        } else {
                                            focus.style("display", null);
                                            onBluePath = true;                                          
                                            showTooltip(t,v,c);
                                        };
                                     })
        .on("mouseout", function() { focus.style("display", "none");
                                        onBluePath = false;
                                        hideTooltip();
                                   })
        .on("mousemove", mousemove);
    
    //Draw y axis
    svg.append("g")
        .attr("class", "axisBlue")
        .attr("transform", "translate(-95,0)")
        .style("opacity", 0)
        .style("fill", blue)
        .call(yAxisBlue)
        .transition()
        .duration(500)
        .style("opacity", 1);
    
    //Dray y label
    svg.append("text")
        .attr("id", "textBlue")
        .style("fill", blue)
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("dy", -145)
        .style("text-anchor", "middle")
        .style("opacity", 0)
        .text("Global Annual Temp. Mean (C)")
        .transition()
        .duration(500)
        .style("opacity", 1);
    
    //Dray title box/button
    svg.append("rect")
        .attr("id", "blueRect")
        .attr("x", -160)
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
    
    //Create line
    svg.append("path")
    .datum(carbData)
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
        .data(carbData)
        .enter().append("circle")
        .attr("id", "yellowCircle")
        .style("opacity", 0)
        .attr("r", 10)
        .attr("cx", function(d) { return xScaleYellow(d.CO2_Year); })
        .attr("cy", function(d) { return yScaleYellow(d.Mean); })
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
    
    //Draw y axis
    svg.append("g")
        .attr("class", "axisYellow")
        .attr("transform", "translate(740,0)")
        .style("opacity", 0)
        .style("fill", yellow)
        .call(yAxisYellow)
        .transition()
        .duration(500)
        .style("opacity", 1)
        .selectAll("text")
        .attr("dx", "2.6em");
    
    //Draw y label
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
    
    //Draw title box/button
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
        .style("opacity",0)
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
        )
        .transition()
        .duration(500)
        .style("opacity", 1);
};

//////////////////////////////////////////////////////////////////////////////////

function dataPrint4() {
    
    //Create line
    svg.append("path")
    .datum(iceData)
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
        .data(iceData)
        .enter().append("circle")
        .attr("id", "greenCircle")
        .style("opacity", 0)
        .attr("r", 10)
        .attr("cx", function(d) { return xScaleGreen(d.Ice_Year); })
        .attr("cy", function(d) { return yScaleGreen(d.size); })
        .style("pointer-events", "painted")
        .on("mouseover", function(d) { focus.style("display", null);
                                        onGreenPath = true;
                                        t = d.Ice_Year;
                                        v = d.size;
                                        c = this;
                                        showTooltip(t,v,c);
                                     })
        .on("mouseout", function() { focus.style("display", "none");
                                        onGreenPath = false;
                                        hideTooltip();
                                   })
        .on("mousemove", mousemove);
    
    //Draw y axis
    svg.append("g")
        .attr("class", "axisGreen")
        .style("opacity", 0)
        .attr("transform", "translate(820,0)")
        .style("fill", green)
        .call(yAxisGreen)
        .transition()
        .duration(500)
        .style("opacity", 1)
        .selectAll("text")
        .attr("dx", "2.4em");
    
    //Draw y label
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
    
    //Draw title box/button
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

//append hollow circle
focus.append("circle")
    .attr("class", "y")
    .style("fill", "none")
    .style("stroke", red)
    .attr("r", 8);

// append the x line
focus.append("line")
    .attr("class", "x")
    .style("stroke", red)
    .style("stroke-dasharray", "3,3")
    .style("opacity", 1)
    .attr("y1", 0)
    .attr("y2", height);

// append the y line
focus.append("line")
    .attr("class", "y")
    .style("stroke", red)
    .style("stroke-dasharray", "3,3")
    .style("opacity", 1)
    .attr("x1", 0)
    .attr("x2", width);

/***************Tooltip Logic***************/

//get cursor position and draw circle and dashed line at data point
function mousemove() {

    if (onRedPath) {

        var x0 = xScaleRed.invert(d3.mouse(this)[0]),
            i = bisectDate1(seaData, x0, 1),
            d0 = seaData[i - 1],
            d1 = seaData[i] == undefined ? seaData[i - 1] : seaData[i],
            d = ((x0 - d0.Sea_Year) > (d1.Sea_Year - x0)) ? d1 : d0;

        focus.select("circle")
            .style("stroke", red)
        focus.selectAll("line")
            .style("stroke", red);

        focus.select("circle.y")
            .attr("transform",
                  "translate(" + xScaleRed(d.Sea_Year) + "," +
                                yScaleRed(d.GMSL) + ")");
        focus.select("line.y")
            .attr("transform",
                  "translate(" + xScaleRed(d.Sea_Year) + "," +
                                yScaleRed(d.GMSL) + ")")
                        .attr("x2", width*-2);

        focus.select("line.x")
            .attr("transform",
                  "translate(" + xScaleRed(d.Sea_Year) + "," +
                                yScaleRed(d.GMSL) + ")")
                          .attr("y2", height - yScaleRed(d.GMSL));

    } else if (onBluePath) {

        var x0 = xScaleBlue.invert(d3.mouse(this)[0]),
            i = bisectDate2(tempData, x0, 1),
            d0 = tempData[i - 1],
            d1 = tempData[i] == undefined ? tempData[i-1] : tempData[i],
            d = ((x0 - d0.Temp_Year) > (d1.Temp_Year - x0)) ? d1 : d0;

        focus.select("circle")
            .style("stroke", blue)
        focus.selectAll("line")
            .style("stroke", blue);

        focus.select("circle.y")
            .attr("transform",
                  "translate(" + xScaleBlue(d.Temp_Year) + "," +
                                yScaleBlue(d.Annual_5_Year_Mean) + ")");
        focus.select("line.y")
            .attr("transform",
                  "translate(" + xScaleBlue(d.Temp_Year) + "," +
                                yScaleBlue(d.Annual_5_Year_Mean) + ")")
                        .attr("x2", width*-2);

        focus.select("line.x")
            .attr("transform",
                  "translate(" + xScaleBlue(d.Temp_Year) + "," +
                                yScaleBlue(d.Annual_5_Year_Mean) + ")")
                          .attr("y2", height - yScaleBlue(d.Annual_5_Year_Mean));
    } else if (onYellowPath) {

        var x0 = xScaleYellow.invert(d3.mouse(this)[0]),
            i = bisectDate3(carbData, x0, 1),
            d0 = carbData[i - 1],
            d1 = carbData[i] == undefined ? carbData[i-1] : carbData[i],
            d = ((x0 - d0.CO2_Year) > (d1.CO2_Year - x0)) ? d1 : d0;

        focus.select("circle")
            .style("stroke", yellow)
        focus.selectAll("line")
            .style("stroke", yellow);

        focus.select("circle.y")
            .attr("transform",
                  "translate(" + xScaleYellow(d.CO2_Year) + "," +
                                yScaleYellow(d.Mean) + ")");
        focus.select("line.y")
            .attr("transform",
                  "translate(" + xScaleYellow(d.CO2_Year) + "," +
                                yScaleYellow(d.Mean) + ")")
                        .attr("x2", width + width);

        focus.select("line.x")
            .attr("transform",
                  "translate(" + xScaleYellow(d.CO2_Year) + "," +
                                yScaleYellow(d.Mean) + ")")
                          .attr("y2", height - yScaleYellow(d.Mean));
    } else if (onGreenPath) {

        var x0 = xScaleGreen.invert(d3.mouse(this)[0]),
            i = bisectDate4(iceData, x0, 1),
            d0 = iceData[i - 1],
            d1 = iceData[i] == undefined ? iceData[i-1] : iceData[i],
            d = ((x0 - d0.Ice_Year) > (d1.Ice_Year - x0)) ? d1 : d0;

        focus.select("circle")
            .style("stroke", green)
        focus.selectAll("line")
            .style("stroke", green);

        focus.select("circle.y")
            .attr("transform",
                  "translate(" + xScaleGreen(d.Ice_Year) + "," +
                                yScaleGreen(d.size) + ")");
        focus.select("line.y")
            .attr("transform",
                  "translate(" + xScaleGreen(d.Ice_Year) + "," +
                                yScaleGreen(d.size) + ")")
                        .attr("x2", width + width);

        focus.select("line.x")
            .attr("transform",
                  "translate(" + xScaleGreen(d.Ice_Year) + "," +
                                yScaleGreen(d.size) + ")")
                          .attr("y2", height - yScaleGreen(d.size));
    };


};

//Display Tooltip/info
function showTooltip(t,v,c){
    
    var h = -90;
    var w = -78;
    
    var matrix = c.getScreenCTM()
        .translate(+c.getAttribute("cx"),+c.getAttribute("cy"));
        tooltip.transition().duration(200).style("opacity", 0.95); 
    
    if(onRedPath){
        tooltip.html("<p class='center-align'>Global Mean Sea Level"
            +"</p><p class='left-align'>Year:<span class='right-align'>" + t + "</span></p>"
            +"<p class='left-align'>Sea Level:<span class='right-align'>" + (v>0?"+":"") + v + "mm</span></p>")  
            .style("left", window.pageXOffset + matrix.e + w + "px")     
            .style("top", window.pageYOffset + matrix.f + h + "px");
    } else if (onBluePath) {
        tooltip.html("<p class='center-align'>Global Annual Temp. Mean</p><p class='center-align'>(relative to 1951-80)"
            +"</p><p class='left-align'>Year:<span class='right-align'>" + t + "</span></p>"
            +"<p class='left-align'>Temp:<span class='right-align'>" + (v>0?"+":"") + v + "&deg;C</span></p>")
            .style("left", window.pageXOffset + matrix.e + w + "px")     
            .style("top", window.pageYOffset + matrix.f + h - 40 +"px");
    } else if (onYellowPath) {
        tooltip.html("<p class='center-align'>Global Annual C0<sub>2</sub> Emiss. Mean"
            +"</p><p class='left-align'>Year:<span class='right-align'>" + t + "</span></p>"
            +"<p class='left-align'>Emiss:<span class='right-align'>" + v + "ppm</span></p>")
            .style("left", window.pageXOffset + matrix.e + w + "px")     
            .style("top", window.pageYOffset + matrix.f + h - 15 + "px");
    } else if (onGreenPath) {
        tooltip.html("<p class='center-align'>Artic Sea Ice Minimum"
            +"</p><p class='left-align'>Year:<span class='right-align'>" + t + "</span></p>"
            +"<p class='left-align'>Area:<span class='right-align'>" + v + "M sq. km</span></p>")
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

    svg.select(".axisRed").transition().duration(1000).call(yAxisRed);
    svg.select("#xAxis").transition().duration(1000).call(xAxisRed);
    console.log("red " + yScaleRed.domain());
    svg.selectAll("#redLine")
        .datum(seaData)
        .transition().duration(1000)
        .attr("d", line1);  
    svg.selectAll("#redCircle")
        .data(seaData)
        .attr("cx", function(d) { return xScaleRed(d.Sea_Year); })
        .attr("cy", function(d) { return yScaleRed(d.GMSL); });

};

function zoomed2() {

    svg.select(".axisBlue").transition().duration(1000).call(yAxisBlue);
    svg.select(".x.axis").call(xAxisBlue);
    svg.selectAll("#blueLine")
        .datum(tempData)
        .transition().duration(1000)
        .attr("d", line2);  
    svg.selectAll("#blueCircle")
        .data(tempData)
        .attr("cx", function(d) { return xScaleBlue(d.Temp_Year); })
        .attr("cy", function(d) { return yScaleBlue(d.Annual_5_Year_Mean); });

};

function zoomed3() {

    svg.select(".axisYellow").transition().duration(1000).call(yAxisYellow);
    svg.select(".axisYellow").selectAll("text").attr("dx", "2.6em");
    svg.select(".x.axis").call(xAxisYellow);
    svg.selectAll("#yellowLine")
        .datum(carbData)
        .transition().duration(1000)
        .attr("d", line3);
    svg.selectAll("#yellowCircle")
        .data(carbData)
        .attr("cx", function(d) { return xScaleYellow(d.CO2_Year); })
        .attr("cy", function(d) { return yScaleYellow(d.Mean); });

};

function zoomed4() {

    svg.select(".axisGreen").transition().duration(1000).call(yAxisGreen);
    svg.select(".axisGreen").selectAll("text").attr("dx", "2.4em");
    svg.select(".x.axis").call(xAxisGreen);
    svg.selectAll("#greenLine")
        .datum(iceData)
        .transition().duration(1000)
        .attr("d", line4);                          
    svg.selectAll("#greenCircle")
        .data(iceData)
        .attr("cx", function(d) { return xScaleGreen(d.Ice_Year); })
        .attr("cy", function(d) { return yScaleGreen(d.size); });
};

/***************Zoom Out Logic/Seperate Lines***************/

function zoomOut() {
    
    svg.call(
        d3.behavior.zoom()
        .y(yScaleRed)
        .scaleExtent([1, 10])
        .on("zoom", zoomed1)
        .y(yScaleRed.domain( displayMore == false ? [-138.81745544323303,81.98254455676701] : [-370.5873381902873,82.45929302054348] ))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScaleBlue)
        .scaleExtent([1, 10])
        .on("zoom", zoomed2)
        .y(yScaleBlue.domain( displayMore == false ? [-0.12298306496912875,0.9170169350308713] : [-1.0490103069115129,1.3402822714823206] ))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScaleYellow)
        .scaleExtent([1, 10])
        .on("zoom", zoomed3)
        .y(yScaleYellow.domain( displayMore == false ? [318.22523749494553,431.00523749494556] : [250.8646806411217,529.3551098266029] ))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScaleGreen)
        .scaleExtent([1, 10])
        .on("zoom", zoomed4)
        .y(yScaleGreen.domain( displayMore == false ? [8.354811609268188,-0.20518839073181194] : [10.65405455025001,-9.011661287299242] ))
        .event);

};  

/***************Reset Zoom Logic/Overlap Lines***************/
function zoomReset() {

    svg.call(
        d3.behavior.zoom()
        .y(yScaleRed)
        .scaleExtent([1, 10])
        .on("zoom", zoomed1)
        .y(yScaleRed.domain( displayMore == false ? [-22.5,76.1] : d3.extent(seaData, function(d) { return d.GMSL;}) ))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScaleBlue)
        .scaleExtent([1, 10])
        .on("zoom", zoomed2)
        .y(yScaleBlue.domain( displayMore == false ? [0.18,0.7] : d3.extent(tempData, function(d) { return d.Annual_5_Year_Mean;}) ))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScaleYellow)
        .scaleExtent([1, 10])
        .on("zoom", zoomed3)
        .y(yScaleYellow.domain(d3.extent(carbData, function(d) { return d.Mean;})))
        .event);

    svg.call(
        d3.behavior.zoom()
        .y(yScaleGreen)
        .scaleExtent([1, 10])
        .on("zoom", zoomed4)
        .y(yScaleGreen.domain( (d3.extent(iceData, function(d) { return d.size;})).reverse() ))
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

//have to redraw graph b/c axis color are defined in css
//thus, update css and redraw. 
function redrawGraph() {
    red = tempRed;
    blue = tempBlue;
    yellow = tempYellow;
    green = tempGreen;
    isolateCounter++;
    
    //get css information to edit later
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

//logic to move blue axis closer to graph
function moveBlue() {
    svg.selectAll("#redRect")
        .attr("x", redrawCounter%2 != 0 ? -160 : -80);
    svg.selectAll("#textRed")
        .attr("dy", redrawCounter%2 != 0 ? -145 : -65);
    svg.selectAll(".axisRed")
        .attr("transform", "translate(" + (redrawCounter%2 != 0 ? "-100" : "-20") + ",0)" );

    svg.selectAll("#blueRect")
        .transition()
        .duration(500)
        .attr("x", redrawCounter%2 != 0 ? -85 : -160 );
    svg.selectAll("#textBlue")
        .transition()
        .duration(500)
        .attr("dy", redrawCounter%2 != 0 ? -70 : -145);
    svg.selectAll(".axisBlue")
        .transition()
        .duration(500)
        .attr("transform", "translate(" + (redrawCounter%2 != 0 ? "-20" : "-95") + ",0)" );
};

//logic to move green axis closer to graph
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

//Expand the data from 1880-1980 or undo it. 
function displayFullData() {

    svg.call(
        d3.behavior.zoom()
        .x(xScaleRed)
        .y(yScaleRed)
        .scaleExtent([1, 10])
        .on("zoom", zoomed1)
        .x(xScaleRed.domain([displayMore == true ? 1880 : 1979,2015]))
        .y(yScaleRed.domain((displayMore == true) ? (d3.extent(seaData, function(d) { return d.GMSL;})) : [-22.5,76.1]))
        .event);
    
    svg.call(
        d3.behavior.zoom()
        .x(xScaleBlue)
        .y(yScaleBlue)
        .scaleExtent([1, 10])
        .on("zoom", zoomed2)
        .x(xScaleBlue.domain([displayMore == true ? 1880 : 1979,2015]))
        .y(yScaleBlue.domain((displayMore == true) ? (d3.extent(tempData, function(d) { return d.Annual_5_Year_Mean;})) : [0.18,0.7]))
        .event);
    
    svg.call(
        d3.behavior.zoom()
        .x(xScaleYellow)
        .scaleExtent([1, 10])
        .on("zoom", zoomed3)
        .x(xScaleYellow.domain([displayMore == true ? 1880 : 1979,2015]))
        .event);
    
    svg.call(
        d3.behavior.zoom()
        .x(xScaleGreen)
        .scaleExtent([1, 10])
        .on("zoom", zoomed4)
        .x(xScaleGreen.domain([displayMore == true ? 1880 : 1979,2015]))
        .event);
    
    if(zoomToggled == true){
        zoomReset();
        zoomOut();
    };
};