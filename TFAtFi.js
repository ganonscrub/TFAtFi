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

function Employee( name, start, end, position ){
	if ( end === undefined || end === null )
		end = "";
	
	this.name = name.toUpperCase();
	this.start = start;
	this.end = end;
    this.position = position.toUpperCase();
}

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
        console.log( positions[i].innerHTML.toUpperCase(), position );
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
    
	var includeEndTime = false;
	var text = document.getElementById( "employeeDump" ).value;
	text = text.trim().replace( /\n\n/g, "|" ).replace( /\n/g, "|" ).replace( /am/g, "AM" ).replace( /pm/g, "PM" );
	tokens = text.split( "|" );
    
    // expect 5 tokens: name, late, start, end, route
	
	for ( var i = 0; i < tokens.length / 5; i++ ){
        var off = i * 5;
        Employees.push( new Employee( tokens[off], tokens[off+2], tokens[off+3], getPosition( tokens[off+4] ) ) );
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
	
	setName( nameSelect, employee.name );
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

var textarea = document.createElement( "textarea" );
textarea.style.width = "800px";
textarea.style.height = "32px";
textarea.id = "employeeDump";
document.body.appendChild( textarea );
document.body.appendChild( document.createElement( "br" ) );

var parsebutton = document.createElement( "input" );
parsebutton.type = "button";
parsebutton.value = "Parse Employees";
parsebutton.addEventListener( "click", parseEmployeeList );
document.body.appendChild( parsebutton );
