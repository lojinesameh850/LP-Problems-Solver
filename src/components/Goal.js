import React, { useEffect, useState } from "react";
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
  const [goalTypes, setGoalTypes] = useState([]);
  const [RHS, setRHS] = useState([]);
  const [GoalRHS, setGoalRHS] = useState([]);
  const [priority, setPriority] = useState([]);
  const [method, setMethod] = useState("goal");
  const [checkBox, setCheckBox] = useState([]);
  const [ursVars, setUrsVars] = useState([]);
  const [numGoals, setNumGoals] = useState(2);
  const [goals, setGoals] = useState([]);
  const [result, setResult] = useState(null);
  const [generateKey, setgenerateKey] = useState(0)
  useEffect(() => {
    setResult(null);
  }, []);

  const handleGenerate = () => {
    setResult(null);
    setObjecFunc(Array.from({ length: numVars }, () => 0));
    setGoals(
      Array.from({ length: numGoals }, () =>
        Array.from({ length: numVars }, () => 0)
      )
    );
    setMatrix(
      Array.from({ length: numConstraints }, () =>
        Array.from({ length: numVars }, () => 0)
      )
    );
    // setObjecMatrix(
    //   Array.from({ length: numFunc }, () =>
    //     Array.from({ length: numVars }, () => '0')
    //   )
    // );
    setPriority(Array.from({ length: numPrio }, () => "0"));
    setRHS(Array.from({ length: numConstraints }, () => 0));
    setGoalRHS(Array.from({ length: numGoals }, () => 0));
    setTypes(Array.from({ length: numConstraints }, () => "<="));
    setGoalTypes(Array.from({ length: numGoals }, () => "<="));

    setPriority(Array.from({ length: numPrio }, () => "0"));
    setCheckBox(Array.from({ length: numVars }, (_, index) => index));
    setgenerateKey((generateKey)=>generateKey+1)
  };

  const handleChange = (row, col, value) => {
    const newMatrix = matrix.map((r, rowIndex) =>
      rowIndex === row
        ? r.map((c, colIndex) =>
            colIndex === col ? parseInt(String(value).trim(), 10) : c
          )
        : r
    );
    setMatrix(newMatrix);
  };
  const handleGoalChange = (row, col, value) => {
    const newGoals = goals.map((r, rowIndex) =>
      rowIndex === row
        ? r.map((c, colIndex) =>
            colIndex === col ? parseInt(String(value).trim(), 10) : c
          )
        : r
    );
    setGoals(newGoals);
  };
  // useEffect(() => {
  //   console.log(matrix)
  // }, [matrix])

  const handleCheckboxChange = (index) => {
    setUrsVars((prev) =>
      prev.includes(index - 1)
        ? prev.filter((i) => i !== index - 1)
        : [...prev, index - 1]
    );
  };

  const handleSolve = async () => {
    const updatedMatrix = matrix.map((row, i) => [
      ...row,
      types[i],
      parseInt(String(RHS[i]).trim(), 10),
    ]);
    const updatedGoals = goals.map((row, i) => [
      ...row,
      goalTypes[i],
      parseInt(String(GoalRHS[i]).trim(), 10),
    ]);
    const finalGoals = [...updatedMatrix, ...updatedGoals];
    
    let data = {
      goals: finalGoals,
      unrestricted_vars: ursVars,
      operation: 4,
      num_constraints: numConstraints,
    };
    console.log(data)
    try {
      const response = await fetch("http://127.0.0.1:8000/hello/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Backend Response:", result);
      let steps = result.steps;
      let basic_vars = result.basic_vars;
      let feasible = result.feasible;
      let var_names = result.var_names;
      setResult(result);
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
          <h2>Enter number of Goals</h2>
          <Textarea
            type="number"
            variant="soft"
            sx={{ width: "50px", height: "10px" }}
            maxRows={1}
            value={numGoals}
            onChange={(e) => setNumGoals(Number(e.target.value))}
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
              <h2 style={{ marginBottom: "10px", justifyContent: "center" }}>
                Please fill in your goals with the higher priority ones on top{" "}
              </h2>
              {goals.map((row, rowIndex) => (
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
                        handleGoalChange(rowIndex, colIndex, e.target.value)
                      }
                    />
                  ))}

                  {/* Choose constraint type */}
                  <Select
                    sx={{ height: "35px", width: "70px", fontSize: "20px" }}
                    placeholder="Type"
                    value={goalTypes[rowIndex] || "<="}
                    onChange={(event, newValue) => {
                      const newTypes = [...goalTypes];
                      newTypes[rowIndex] = newValue; // Ensure newValue is assigned correctly
                      setGoalTypes(newTypes);
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
                      const newRHS = [...GoalRHS];
                      newRHS[rowIndex] = e.target.value;
                      setGoalRHS(newRHS);
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
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
      </div>
      <div>
        {result && result.steps && result.var_names && (
          <div style={{ marginTop: "30px" }}>
            {result.steps.map((matrix, stepIndex) => (
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
            {typeof result.feasible !== "undefined" && (
              <div style={{ marginTop: "20px" }}>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {result.feasible
                    ? "The solution is feasible!"
                    : "The solution is not feasible."}
                </p>
              </div>
            )}
            {result.feasible && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  {result.basic_vars.map((var_name, idx) => (
                    <div>
                      {var_name} ={" "}
                      {
                        result.steps[result.steps.length - 1][
                          idx + numConstraints + numGoals
                        ][result.steps[0][0].length - 1]
                      }
                    </div>
                  ))}
                </div>
                <div>
                  {result.steps[result.steps.length - 1]
                    .slice(numConstraints, numConstraints + numGoals )
                    .map((row, idx) => (
                      <p
                        key={idx}
                        style={{ fontSize: "1.25rem", fontWeight: "500" }}
                      >
                        Loss of goal {idx+1} = {row[row.length - 1]}  / <span>{row[row.length-1] != 0 ? "Loss Here" : "No Loss"}</span>
                      </p>
                    ))}
                
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default GoalForm;
