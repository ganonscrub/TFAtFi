// ==UserScript==
// @name         TimeForge Attendance Filler
// @namespace    ganonscrub_script
// @version      0.1
// @description  Makes TimeForge slightly less terrible
// @author       ganonscrub
// @include      *timeforge.com/Scheduler/sa/bulkEnterAttendance.html*
// @grant        none
// @updateURL	 https://raw.githubusercontent.com/ganonscrub/TFAtFi/master/TFAtFi.js
// ==/UserScript==

function Employee( name, position, start, end ){
	this.name = name;
	this.position = position;
	this.start = start;
	this.end = end;
}

Employees = [];

function getHighest(){
	var i = 1;
	while ( (cur = document.getElementById( "emp" + i )) != null )
		i++;
		
	return i - 1;
}

function getHighestRow(){
	return document.getElementById( "row" + getHighest() );
}

function setName( nameBox, name ){
	var names = nameBox.getElementsByTagName( "option" );
	var hitvalue = null;
	for ( var i = 0; i < names.length; i++ ){
		if ( names[i].innerHTML.indexOf( name ) != -1 ){
			nameBox.value = names[i].value;
			break;
		}
	}
}

function setPosition( positionBox, position ){
	var positions = positionBox.getElementsByTagName( "option" );
	var hitvalue = null;
	for ( var i = 0; i < positions.length; i++ ){
		if ( positions[i].innerHTML.indexOf( position ) != -1 ){
			positionBox.value = positions[i].value;
			break;
		}
	}
}

function setTimeValue( timeBox, time ){
	time = time.trim();
	time = time.replace( "am", "AM" ).replace( "pm", "PM" );
	timeBox.value = time;
}

function parseEmployeeList(){
	var driverString = "Driver: Night & Weekend Service";
	var includeEndTime = false;
	var text = document.getElementById( "employeeDump" ).value;
	text = text.trim().replace( /\n/g, "|" ).replace( /am/g, "AM" ).replace( /pm/g, "PM" );
	tokens = text.split( "|" );
	
	var length;
	if ( includeEndTime )
		length = tokens.length / 4;
	else
		length = tokens.length / 3;
	
	for ( var i = 0; i < length; i++ ){
		var off;
		if ( includeEndTime ){
			off = i * 4;
			Employees.push( new Employee( tokens[off], driverString, tokens[off+2], tokens[off+3] ) );
		}
		else{
			off = i * 3 ;
			Employees.push( new Employee( tokens[off], driverString, tokens[off+2] ) );
		}
	}
}

function editCurrentRow(){
	var n = getHighest();
	var row = getHighestRow();
	var nameSelect = document.getElementById( "emp" + n );
	var positionSelect = document.getElementById( "pos" + n );
	var startBox = document.getElementById( "start" + n );
	var endBox = document.getElementById( "end" + n );
	
	setName( nameSelect, "Hennessy, Michael" );
	updatePositions( n );
	setPosition( positionSelect, "Shift Supervisor" );
	setTimeValue( startBox, "6:00AM" );
	setTimeValue( endBox, "3:00PM" );
	
	checkModification( n );
	processLastRowFocus( n );
}

var textarea = document.createElement( "textarea" );
textarea.style.width = "800px";
textarea.style.height = "400px";
textarea.id = "employeeDump";
document.body.appendChild( textarea );