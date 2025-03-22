import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { Textarea, Button, Select, Option, Checkbox } from "@mui/joy";
import { FormControlLabel } from "@mui/material";

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
    const [ursVars, setUrsVars] = useState([]);
  
  
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

    const handleCheckboxChange = (index) => {
      setUrsVars((prev) => 
        prev.includes(index - 1) 
          ? prev.filter(i => i !== index - 1) 
          : [...prev, index - 1] 
      );
    };
  
    const handleSolve = async () => {
      const data = {
        // objecMatrix: objecMatrix,
        objecFunc: objecFunc,
        matrix: matrix,
        RHS: RHS,
        types: types,
        priority: priority,
        method: method,
        ursVars: ursVars
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
      <div style={{ backgroundColor: "#3A404C", height: "100%", width: "100%", color: "#ffffff", padding: "15px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Input taking */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* Take number of decision variables from user */}
          <div style={{ display: "flex", gap: "10px", marginTop: "15px", flexWrap: "wrap", justifyContent: "center" }}>
            <h2>Enter number of Decision Variables</h2>
              <Textarea
              type="number"
              variant="soft"
              sx={{ width: "50px", height: "10px" }}
              maxRows={1}
              value={numVars}
              onChange={(e) => {
                const value = Number(e.target.value);
                setNumVars(value);
                setNumPrio(value);
              }}
              />
          </div>

          {/* Take number of constraints from user */}
          <div style={{ display: "flex", gap: "10px", marginTop: "15px", flexWrap: "wrap", justifyContent: "center" }}>
            <h2>Enter number of Constraints</h2>
              <Textarea
                type="number"
                variant="soft"
                sx={{ width: "50px", height: "10px" }}
                maxRows={1}
                value={numConstraints}
                onChange={(e) => setNumConstraints(Number(e.target.value))}
              />
          </div>
        
        </div>

        {/* Model generation */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
  
          {/* Button triggers model creation on click */}
          <div style={{ marginTop: "15px", marginBottom: "15px", flexWrap: "wrap", justifyContent: "center" }}>
            <Button sx={{
                backgroundColor: "#EC407A",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#D12366",
                },
                "&:active": {
                  backgroundColor: "#B01F5D",
                },
              }} variant="solid" onClick={handleGenerate}>
              Generate Model
            </Button>
          </div>
        
          {/* Model is generated according to input taken so far */}
          {matrix.length > 0 && (
            <>

            {/* Take objective input from user */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "15px", justifyContent: "center" }}>
              <h2>Optimization direction</h2>
                <Select defaultValue="min" onChange={handleChange} sx={{ width: "130px", height: "35px" }}>
                  <Option value="min">Minimize</Option>
                  <Option value="max">Maximize</Option>
                </Select>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "15px", justifyContent: "center" }}>
              <h2>Objective function</h2>
                <p>Z =</p>
                {objecFunc.map((_, index) => (
                  <Textarea
                    key={index}
                    placeholder={`X${index + 1}`}
                    type="number"
                    variant="soft"
                    sx={{ width: "80px", height: "10px" }}
                    maxRows={1}
                  />
                ))}
            </div>
    
            {/* Draw matrix for user to provide input */}
            <div style={{ gap: "10px", marginTop: "15px", justifyContent: "center" }}>

              <h2 style={{ marginBottom: "10px", justifyContent: "center" }}>Please fill in your constraints </h2>
              {matrix.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: "flex", gap: "10px", marginTop: "8px", justifyContent: "center" }}>

                  {row.map((_, colIndex) => (
                    <Textarea
                      key={colIndex}
                      placeholder={`X${colIndex + 1}`}
                      type="number"
                      variant="soft"
                      sx={{ width: "80px", height: "10px" }}
                      maxRows={1}
                      onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                    />
                  ))}

                  {/* Choose constraint type */}
                  <Select
                    sx={{ height: "35px", width: "70px", fontSize: "20px" }}
                    placeholder="Type"
                    value={types[rowIndex] || "<="} 
                    onChange={(event, newValue) => {
                      const newTypes = [...types];
                      newTypes[rowIndex] = newValue; // Ensure newValue is assigned correctly
                      setTypes(newTypes);
                    }}
                  >
                    <Option sx={{ fontSize: "20px" }} value="<=">
                      {" ≤ "}
                    </Option>
                    <Option sx={{ fontSize: "20px" }} value=">=">
                      {" ≥ "}
                    </Option>
                    <Option sx={{ fontSize: "20px" }} value="=">
                      {" = "}
                    </Option>
                  </Select>

                  <Textarea
                    placeholder="RHS"
                    type="number"
                    variant="soft"
                    sx={{ width: "80px", height: "10px" }}
                    maxRows={1}
                    onChange={(e) => {
                      const newRHS = [...RHS];
                      newRHS[rowIndex] = e.target.value;
                      setRHS(newRHS);
                    }}
                  />

                </div>
              ))}
              
            </div>

            {/* Unrestricted Variables */}
              <div style={{ display: "flex", gap: "10px", marginTop: "15px", marginBottom: "15px", justifyContent: "center" }}>
                <h2 style={{ marginRight: "10px" }}>Unrestricted Variables</h2>
                  {Array.from({ length: numVars }, (_, index) => (
                    <FormControlLabel style={{ display: "flex", gap: "10px" }}
                      key={index}
                      control={
                        <Checkbox
                          color="primary"
                          checked={ursVars.includes(index)}
                          onChange={() => handleCheckboxChange(index + 1)}
                        />
                      }
                      label={`X${index + 1}`}
                    />
                  ))}
              </div>
            </>
          )}

        </div>

        {/* Model solving */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Button triggers model solving on click */}
          {matrix.length > 0 && (
            <div style={{ display: "flex", gap: "10px", marginTop: "15px",  marginBottom: "15px", justifyContent: "center" }}>
              <Button sx={{
                  backgroundColor: "#EC407A",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#D12366",
                  },
                  "&:active": {
                    backgroundColor: "#B01F5D",
                  },
                }} variant="solid" onClick={handleSolve}>
                Solve
              </Button>
            </div>
          )}
        </div>

      </div>
    );
};
export default GoalForm;
