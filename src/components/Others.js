import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Textarea, Button, Select, Option, Checkbox } from "@mui/joy";
import { FormControlLabel } from "@mui/material";

function OthersForm() {
  const [numVars, setNumVars] = useState(2);
  const [numConstraints, setNumConstraints] = useState(2);
  const [objecFunc, setObjecFunc] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [types, setTypes] = useState([]);
  const [RHS, setRHS] = useState([]);
  const [method, setMethod] = useState(2);
  const [checkBox, setCheckBox] = useState([]);
  const [ursVars, setUrsVars] = useState([]);
  const [objectiveType, setObjectiveType] = useState("min");
  const [result, setResult] = useState(null);
  const [generateKey, setGenerateKey] = useState(0);
  const handleGenerate = () => {
    setObjecFunc(Array.from({ length: numVars }, () => 0));
    setMatrix(
      Array.from({ length: numConstraints }, () =>
        Array.from({ length: numVars }, () => 0)
      )
    );
    setRHS(Array.from({ length: numConstraints }, () => 0));
    setTypes(Array.from({ length: numConstraints }, () => "<="));
    setCheckBox(Array.from({ length: numVars }, (_, index) => index));
    setMethod(2);
    setResult(null);
    setGenerateKey((key) => key + 1);
  };
  useEffect(() => {
    console.log(`result is ${result}`)
  }, [result])
  
  const handleChange = (row, col, value) => {
    const newMatrix = matrix.map((r, rowIndex) =>
      rowIndex === row
        ? r.map((c, colIndex) => (colIndex === col ? parseInt(value, 10) : c))
        : r
    );
    setMatrix(newMatrix);
  };
  const handleObjectChange = (index, value) => {
    const newObjecFunc = [...objecFunc];

    // Accept numeric values, empty input, and "+" or "-" signs
    if (/^[-+]?\d*\.?\d*$/.test(value) || value === "") {
      newObjecFunc[index] =
        value === "" || value === "+" || value === "-" ? value : Number(value);
      setObjecFunc(newObjecFunc);
    }
  };
  const askForMethod = types.some((type) => type === ">=" || type === "=");
  useEffect(() => {
    if (!askForMethod) {
      setMethod(2);
    }
  }, [askForMethod]);

  const handleCheckboxChange = (index) => {
    setUrsVars((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };
  const handleOptimizationChange = (event, newValue) => {
    console.log(newValue); // Directly prints the selected value
    setObjectiveType(newValue); // Sets the state directly
  };
  const handleSolve = async () => {
    console.log(matrix);
    function parseNumbers(obj) {
      obj.objective = obj.objective.map((value) =>
        value === "" ? "" : parseInt(String(value).trim(), 10) || 0
      );

      obj.constraints = obj.constraints.map((constraint) =>
        constraint.map((value, index) => {
          if (index === constraint.length - 2) return value; // Operator like '=' or '≥'
          return value === "" ? "" : parseInt(String(value).trim(), 10) || 0;
        })
      );

      obj.operation =
        obj.operation === ""
          ? ""
          : parseInt(String(obj.operation).trim(), 10) || 0;

      return obj;
    }
    const updatedMatrix = matrix.map((row, i) => [...row, types[i], RHS[i]]);
    console.log(objecFunc);
    let data = {
      objective: objecFunc,
      constraints: updatedMatrix,
      operation: method,
      unrestricted_vars: ursVars,
      objective_type: objectiveType,
    };
    data = parseNumbers(data);
    console.log(data);
    try {
      const response = await fetch("http://127.0.0.1:8000/hello/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const new_data = await response.json();
      console.log(new_data)
      console.log("Backend Response:", new_data);
      setResult(new_data);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#3A404C",
        height: "100%",
        width: "100%",
        color: "#ffffff",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "scroll",
      }}
      key={generateKey}
    >
      {/* Input taking */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Take number of decision variables from user */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* Take number of desicion variables from user */}
          <h2>Enter number of Decision Variables</h2>
          <Textarea
            type="number"
            variant="soft"
            sx={{ width: "50px", height: "10px" }}
            maxRows={1}
            value={numVars}
            onChange={(e) => setNumVars(Number(e.target.value))}
          />
        </div>

        {/* Take number of constraints from user */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Button triggers model creation on click */}
        <div
          style={{
            marginTop: "15px",
            marginBottom: "15px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            sx={{
              backgroundColor: "#EC407A",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#D12366",
              },
              "&:active": {
                backgroundColor: "#B01F5D",
              },
            }}
            variant="solid"
            onClick={handleGenerate}
          >
            Generate Model
          </Button>
        </div>

        {/* Model is generated according to input taken so far */}
        {matrix.length > 0 && (
          <>
            {/* Take objective input from user */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "15px",
                justifyContent: "center",
              }}
            >
              <h2>Optimization direction</h2>
              <Select
                defaultValue="min"
                onChange={handleOptimizationChange}
                sx={{ width: "130px", height: "35px" }}
              >
                <Option value="min">Minimize</Option>
                <Option value="max">Maximize</Option>
              </Select>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "15px",
                justifyContent: "center",
              }}
            >
              <h2>Objective function</h2>
              <p>Z =</p>
              {objecFunc.map((value, index) => (
                <Textarea
                  key={index}
                  placeholder={`X${index + 1}`}
                  type="number"
                  value={value}
                  onChange={(e) => handleObjectChange(index, e.target.value)}
                  variant="soft"
                  sx={{ width: "80px", height: "10px" }}
                  maxRows={1}
                />
              ))}
            </div>

            {/* Draw matrix for user to provide input */}
            <div
              style={{
                gap: "10px",
                marginTop: "15px",
                justifyContent: "center",
              }}
            >
              <h2 style={{ marginBottom: "10px", justifyContent: "center" }}>
                Please fill in your constraints{" "}
              </h2>
              {matrix.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "8px",
                    justifyContent: "center",
                  }}
                >
                  {row.map((_, colIndex) => (
                    <Textarea
                      key={colIndex}
                      placeholder={`X${colIndex + 1}`}
                      type="number"
                      variant="soft"
                      sx={{ width: "80px", height: "10px" }}
                      maxRows={1}
                      onChange={(e) =>
                        handleChange(rowIndex, colIndex, e.target.value)
                      }
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
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
                marginBottom: "15px",
                justifyContent: "center",
              }}
            >
              <h2 style={{ marginRight: "10px" }}>Unrestricted Variables</h2>
              {checkBox.map((_, index) => (
                <FormControlLabel
                  style={{ display: "flex", gap: "10px" }}
                  key={index}
                  control={
                    <Checkbox
                      color="primary"
                      checked={ursVars.includes(index)}
                      onChange={() => handleCheckboxChange(index)}
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Allow user to choose preffered method between BigM and Two Phase */}
        {askForMethod && (
          <>
            <Select
              defaultValue="2"
              onChange={(_, newValue) => {
                console.log(newValue);
                setMethod(newValue);
              }}
              sx={{ width: "200px", height: "35px", marginTop: "15px" }}
            >
              <Option value="2">Big M Method</Option>
              <Option value="3">Two Phase Method</Option>
            </Select>
          </>
        )}

        {/* Button triggers model solving on click */}
        {matrix.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "15px",
              marginBottom: "15px",
              justifyContent: "center",
            }}
          >
            <Button
              sx={{
                backgroundColor: "#EC407A",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#D12366",
                },
                "&:active": {
                  backgroundColor: "#B01F5D",
                },
              }}
              variant="solid"
              onClick={handleSolve}
            >
              Solve
            </Button>
          </div>
        )}
        {result && result.solution && result.old_names && (
          <div style={{ marginTop: "30px" }}>
            {result.solution.map((matrix, stepIndex) => (
              <div key={stepIndex} style={{ marginBottom: "30px" }}>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
                  Step {stepIndex + 1}
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "1.2rem",
                  }}
                >
                  <thead>
                    <tr>
                      {result.old_names.map((name, idx) => (
                        <th
                          key={idx}
                          style={{
                            border: "2px solid #333",
                            padding: "10px",
                            backgroundColor: "#EC407A",
                            textAlign: "center",
                          }}
                        >
                          {name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            style={{
                              border: "2px solid #333",
                              padding: "10px",
                              textAlign: "center",
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
        {result && result.steps && result.var_names && (
          <div style={{ marginTop: "30px" }}>
            {result.steps.map((matrix, stepIndex) => (
              <div key={stepIndex} style={{ marginBottom: "30px" }}>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
                  Step {stepIndex + 1 + (result.solution ? result.solution.length : 0)}
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "1.2rem",
                  }}
                >
                  <thead>
                    <tr>
                      {result.var_names.map((name, idx) => (
                        <th
                          key={idx}
                          style={{
                            border: "2px solid #333",
                            padding: "10px",
                            backgroundColor: "#EC407A",
                            textAlign: "center",
                          }}
                        >
                          {name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            style={{
                              border: "2px solid #333",
                              padding: "10px",
                              textAlign: "center",
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <p
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {result.feasible
            ? "The Solution is feasible"
            : "The Solution is infeasible"}
        </p>
          </div>
          
        )}
        

        {result && result.feasible && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              objective = {result.steps[result.steps.length-1][0][result.steps[0][0].length-1]}
              {result.basic_vars.map((name,idx)=>
              (
                <div>
                    {name} = {result.steps[result.steps.length-1][1+idx][result.steps[0][0].length-1]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default OthersForm;
