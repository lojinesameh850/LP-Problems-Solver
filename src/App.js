import React, { useState } from "react";
import { Textarea, Select, Option, Button } from "@mui/joy";

const LinearProgrammingModel = () => {
  const [numVars, setNumVars] = useState(2);
  const [numConstraints, setNumConstraints] = useState(2);
  const [matrix, setMatrix] = useState([]);

  const handleGenerate = () => {
    setMatrix(
      Array.from({ length: numConstraints }, () =>
        Array.from({ length: numVars }, () => "")
      )
    );
  };

  const handleChange = (row, col, value) => {
    const newMatrix = matrix.map((r, rowIndex) =>
      rowIndex === row ? r.map((c, colIndex) => (colIndex === col ? value : c)) : r
    );
    setMatrix(newMatrix);
  };

  return (
    <div className="flex flex-col gap-4 p-4">

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
        <h2 className="text-lg font-semibold">Number of Decision Variables</h2>
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
        <Select defaultValue="min" onChange={handleChange} sx={{ width: "150px", height: "10px" }}>
          <Option value="min">Minimize</Option>
          <Option value="max">Maximize</Option>
        </Select>
      </div>

      <div>
        <Button variant="contained" color="primary" onClick={handleGenerate}>
          Generate Model
        </Button>
      </div>

      {matrix.length > 0 && (
        <>
          <h3>Objective Function:</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Array.from({ length: numVars }).map((_, index) => (
              <Textarea
                key={index}
                size="small"
                variant="outlined"
                placeholder={`X${index + 1}`}
                sx={{ width: "60px" }}
              />
            ))}
          </div>

          <h3>Constraints</h3>
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
            </div>
          ))}
        </>
      )}
      {matrix.length > 0 && (
        <>
          <h3>Objective Function:</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Array.from({ length: numVars }).map((_, index) => (
              <Textarea
                key={index}
                size="small"
                variant="outlined"
                placeholder={`X${index + 1}`}
                sx={{ width: "60px" }}
              />
            ))}
          </div>

          <h3>Constraints</h3>
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
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default LinearProgrammingModel;
