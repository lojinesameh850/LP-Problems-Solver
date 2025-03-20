import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Textarea, Option, Button } from "@mui/joy";
import { FaLessThanEqual, FaGreaterThanEqual, FaEquals } from "react-icons/fa6";
import { Select, MenuItem } from "@mui/material";

function GoalForm() {
    const [numPrio, setNumPrio] = useState(2);
    const [numVars, setNumVars] = useState(2);
    const [numConstraints, setNumConstraints] = useState(2);
    const [objecFunc, setObjecFunc] = useState([]);
    const [matrix, setMatrix] = useState([]);
    const [types, setTypes] = useState([]);
    const [RHS, setRHS] = useState([]);
    const [priority, setPriority] = useState([]);
    const [method, setMethod] = useState("goal");
  
    const handleGenerate = () => {
      setObjecFunc(Array.from({ length: numVars }, () => '0'));
      setMatrix(
        Array.from({ length: numConstraints }, () =>
          Array.from({ length: numVars }, () => '0')
        )
      );
      // setObjecMatrix(
      //   Array.from({ length: numFunc }, () =>
      //     Array.from({ length: numVars }, () => '0')
      //   )
      // );
      setPriority(Array.from({ length: numPrio }, () => '0'));
      setRHS(Array.from({ length: numConstraints }, () => '0'));
      setTypes(Array.from({ length: numConstraints }, () => "<="));
      setPriority(Array.from({ length: numPrio }, () => '0'));
    };
  
    const handleChange = (row, col, value) => {
      const newMatrix = matrix.map((r, rowIndex) =>
        rowIndex === row ? r.map((c, colIndex) => (colIndex === col ? value : c)) : r
      );
      setMatrix(newMatrix);
    };
  
    const handleSolve = async () => {
      const data = {
        // objecMatrix: objecMatrix,
        objecFunc: objecFunc,
        matrix: matrix,
        RHS: RHS,
        types: types,
        priority: priority,
        method: method
      };
    
      try {
        const response = await fetch("http://127.0.0.1:5000/solveLP", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });
    
        const result = await response.json();
        console.log("Backend Response:", result);
      } catch (error) {
        console.error("Error sending data:", error);
      }
    };
  
    return (
      <div className="flex flex-col gap-4 p-4">
  
        {/* Objective Functions*/}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Number of Priority Levels</h1>
          <Textarea
            type="number"
            variant="outlined"
            sx={{ width: "50px", height: "10px" }}
            maxRows={1}
            value={numPrio}
            onChange={(e) => setNumPrio(Number(e.target.value))}
          />
        </div>
  
        {/* Decision Variables */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Number of Decision Variables</h1>
          <Textarea
            type="number"
            variant="outlined"
            sx={{ width: "50px", height: "10px" }}
            maxRows={1}
            value={numVars}
            onChange={(e) => setNumVars(Number(e.target.value))}
          />
        </div>
  
        {/* Constraints */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Number of Constraints</h2>
          <Textarea
            type="number"
            variant="outlined"
            sx={{ width: "50px", height: "10px" }}
            maxRows={1}
            value={numConstraints}
            onChange={(e) => setNumConstraints(Number(e.target.value))}
          />
        </div> 
        
  
        {/* Objective */}
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Objective</h3>
          <Select defaultValue="min" onChange={handleChange} sx={{ width: "150px", height: "35px" }}>
            <MenuItem value="min">Minimize</MenuItem>
            <MenuItem value="max">Maximize</MenuItem>
          </Select>
        </div>
  
        <div>
          <Button variant="contained" color="primary" onClick={handleGenerate}>
            Generate Model
          </Button>
        </div>
  
        
        {matrix.length > 0 && (
          <>
          <h3>Objective Function: </h3>
            {/* {objecMatrix.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <p>Z = </p>
                {row.map((_, colIndex) => (
                  <Textarea
                  key={colIndex}
                  size="small"
                  variant="outlined"
                  placeholder={`X${colIndex + 1}`}
                  sx={{ width: "60px" }}
                />
                ))}
              </div>
            ))} */}
  
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <p>Z =</p>
              {objecFunc.map((_, index) => (
                <Textarea
                  key={index}
                  size="small"
                  variant="outlined"
                  placeholder={`X${index + 1}`}
                  sx={{ width: "60px" }}
                />
              ))}
            </div>
            {numPrio > 0 && (
              <>
            <h3>Priority Levels: </h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              
              {priority.map((_, index) => (
                <>
                <p>Priority X{index + 1}:</p>
                <Textarea
                  key={index}
                  size="small"
                  variant="outlined"
                  placeholder={`X${index + 1}`}
                  sx={{ width: "60px" }}
                />
                </>
              ))}
            </div>
            </>
            )}
  
          <h3>Constraints: </h3>
          {matrix.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              {row.map((_, colIndex) => (
                <Textarea
                  key={colIndex}
                  size="small"
                  variant="outlined"
                  placeholder={`X${colIndex + 1}`}
                  sx={{ width: "60px" }}
                  onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                />
              ))}
              <div className="flex items-center gap-4">
                <Select placeholder="Type" defaultValue="<="  value={types[rowIndex] || "<="}  
                onChange={(e) => {
                  const newTypes = [...types];
                  newTypes[rowIndex] = e.target.value;
                  setTypes(newTypes);
                }} sx={{ width: "80px", height: "auto" }}>
                  <MenuItem value='<='><FaLessThanEqual /></MenuItem>
                  <MenuItem value='>='><FaGreaterThanEqual /></MenuItem>
                  <MenuItem value='='><FaEquals /></MenuItem>
                </Select>
              </div>
              <Textarea
                size="small"
                variant="outlined"
                placeholder="RHS"
                sx={{ width: "60px" }}
                onChange={(e) => {
                  const newRHS = [...RHS];
                  newRHS[rowIndex] = e.target.value;
                  setRHS(newRHS);
                }}
              />
              
            </div>
          ))}
          </>
        )}
        {matrix.length > 0 && (
        <Link to="/home/solution" variant="contained" color="primary" onClick={handleSolve}><h3>Solve</h3></Link>
        )}
      </div>
    );
};
export default GoalForm;
