// ==UserScript==
// @name         TimeForge Attendance Filler
// @namespace    ganonscrub_script
// @version      0.2
// @description  Makes TimeForge slightly less terrible
// @author       ganonscrub
// @include      *timeforge.com/Scheduler/sa/bulkEnterAttendance.html*
// @grant        none
// @updateURL	 https://raw.githubusercontent.com/ganonscrub/TFAtFi/master/TFAtFi.js
// ==/UserScript==

function EmployeeName( fname, lname, value ){
	this.fname = fname;
	this.lname = lname;
	this.value = value;
	this.altnames = [];
	
	this.name = function(){
		return this.fname + " " + this.lname;
	}
	
	this.oname = function(){
		return this.lname + ", " + this.fname;
	}
	
	this.rname = function(){
		return this.fname + ", " + this.lname;
	}
}

function Employee( name, start, end, position ){
	if ( end === undefined || end === null )
		end = "";
	
	this.name = name;
	this.start = start;
	this.end = end;
	this.position = position.toUpperCase();
}

var Names;
var Entered;
var Employees;

function getHighest(){
	var i = 1;
	while ( (cur = document.getElementById( "emp" + i )) != null )
		i++;
		
	return i - 1;
}

function getHighestRow(){
	return document.getElementById( "row" + getHighest() );
}

function loadNames(){
	Names = [];
	var tmp = document.getElementById( "emp1" );
	tmp = tmp.options;
	for ( var i = 0; i < tmp.length; i++ ){
		if ( tmp[i].innerHTML.indexOf( "," ) != -1 ){
			var names = tmp[i].innerHTML.split( "," );
			var fname = names[1].trim().toUpperCase();
			var lname = names[0].trim().toUpperCase();
			var value = tmp[i].value;
			Names.push( new EmployeeName( fname, lname, value ) );
		}
	}
}

function loadEntered(){
	Entered = [];
	var highest = getHighest();
	for ( var i = 1; i < highest; i++ ){
		var cur = document.getElementById( "emp" + i ).selectedOptions[0];
		var names = cur.innerHTML.split( "," );
		var fname = names[1].trim().toUpperCase();
		var lname = names[0].trim().toUpperCase();
		var value = cur.value;
		Entered.push( new EmployeeName( fname, lname, value ) );
	}
}

function getNameStringFromValue( value ){
	for ( var i = 0; i < Names.length; i++ ){
		if ( Names[i].value == value )
			return Names[i].string;
	}
	
	return null;
}

function getNameValueFromString( string ){
	if ( string == "--Choose--" )
		return null;
	
	for ( var i = 0; i < Names.length; i++){
		if ( Names[i].string == string )
			return Names[i].value;
	}
	
	return null;
}

function setName( nameBox, name ){
	var names = nameBox.getElementsByTagName( "option" );
	var hitvalue = null;
	for ( var i = 0; i < names.length; i++ ){
		if ( names[i].innerHTML.toUpperCase().indexOf( name ) != -1 ){
			nameBox.value = names[i].value;
			break;
		}
	}
}

function setPosition( positionBox, position ){
	var positions = positionBox.getElementsByTagName( "option" );
	var hitvalue = null;
	for ( var i = 0; i < positions.length; i++ ){
		if ( positions[i].innerHTML.toUpperCase().indexOf( position ) != -1 ){
			positionBox.value = positions[i].value;
			return;
		}
	}
}

function setTimeValue( timeBox, time ){
	time = time.trim();
	time = time.replace( /am/g, "AM" ).replace( /pm/g, "PM" );
	timeBox.value = time;
}

function getPosition( position ){
	if ( position.toUpperCase().indexOf( "SUPERVISOR" ) != -1 )
		return "Shift Supervisor";
	else if ( position.toUpperCase().indexOf( "DISPATCHER" ) != - 1 )
		return "Dispatcher";
	else
		return "Driver: Night &amp; Weekend Service";
}

function parseEmployeeList(){
	Employees = [];
    
	var text = document.getElementById( "employeeDump" ).value;
	text = text.trim().replace( /\n\n/g, "|" ).replace( /\n/g, "|" ).replace( /am/g, "AM" ).replace( /pm/g, "PM" );
	tokens = text.split( "|" );
    
    // expect 5 tokens: name, late, start, end, route
	
	for ( var i = 0; i < tokens.length / 5; i++ ){
		var off = i * 5;
		var n = tokens[off].split( "," );
		
		var name = new EmployeeName( n[1].trim().toUpperCase(), n[0].trim().toUpperCase(), getNameValueFromString( tokens[off] ) );		
		var late = tokens[off+1];
		var startTime = tokens[off+2];
		var endTime = tokens[off+3];
		var position = tokens[off+4];
		
		Employees.push( new Employee( name, startTime, endTime, position ) );
	}
    
	addEmployees();
}

function editCurrentRow(){
	var employee = Employees.pop();
	var n = getHighest();
	var row = getHighestRow();
	var nameSelect = document.getElementById( "emp" + n );
	var positionSelect = document.getElementById( "pos" + n );
	var startBox = document.getElementById( "start" + n );
	var endBox = document.getElementById( "end" + n );
	
	setName( nameSelect, employee.name.name() );
	updatePositions( n );    
    
	setPosition( positionSelect, employee.position );
    
	setTimeValue( startBox, employee.start );
	setTimeValue( endBox, employee.end );
	
	checkModification( n );
	processLastRowFocus( n );
}

function addEmployees(){
	while ( Employees.length > 0 )
		editCurrentRow();
}

if ( document.getElementById( "employeeDump" ) == null ){
	var textarea = document.createElement( "textarea" );
	textarea.style.width = "800px";
	textarea.style.height = "32px";
	textarea.id = "employeeDump";
	document.body.appendChild( textarea );
	document.body.appendChild( document.createElement( "br" ) );
}

if ( document.getElementById( "parseButton" ) == null ){
	var parsebutton = document.createElement( "input" );
	parsebutton.type = "button";
	parsebutton.value = "Parse Employees";
	parsebutton.id = "parseButton";
	parsebutton.addEventListener( "click", parseEmployeeList );
	document.body.appendChild( parsebutton );
}

loadNames();
loadEntered();