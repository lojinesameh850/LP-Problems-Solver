import numpy as np
from scipy.optimize import linprog

def goal_programming(goals, constraints):
    num_vars = len(goals[0]) - 2  # Dynamically detect number of variables
    num_goals = len(goals)

    # Objective function (Minimize deviations)
    c = np.zeros(num_vars + 2 * num_goals)
    for i in range(num_goals):
        c[num_vars + i] = 1    # Positive deviation
        c[num_vars + num_goals + i] = 1  # Negative deviation

    # Constraints Matrix
    A = []
    b = []

    # Add goal constraints with deviation variables
    for i, goal in enumerate(goals):
        row = goal[:-2] + [0] * (2 * num_goals)
        if goal[-2] == '>=':
            row[num_vars + i] = 1   # Negative deviation for unmet goals
        elif goal[-2] == '<=':
            row[num_vars + num_goals + i] = -1  # Positive deviation for exceeded goals
        A.append(row)
        b.append(goal[-1])

    # Add standard constraints
    for constraint in constraints:
        row = constraint[:-2] + [0] * (2 * num_goals)
        A.append(row)
        b.append(constraint[-1])

    # Variable bounds (including deviations)
    bounds = [(0, None) for _ in range(num_vars)] + [(0, None)] * (2 * num_goals)

    # Debug Information
    print("Objective Function Coefficients (c):", c)
    print("Constraints (A):", np.array(A))
    print("Constraints RHS (b):", b)
    
    # Minimize deviations
    result = linprog(c, A_ub=A, b_ub=b, bounds=bounds, method='highs')

    if result.success:
        print("✅ Optimal Solution Found")
        solution = result.x[:num_vars]
        deviations = result.x[num_vars:]
        print("🔹 Decision Variables:", solution)
        print("🔹 Deviations:", deviations)
    else:
        print("❌ No feasible solution found")
        print(result.message)

# Define Goals and Constraints
goals = [
    [100,400, '>=', 1200],   # x2 >= 1200
    [200,0, '>=', 1000],   # x1 >= 1000
    [ 0,250,'>=', 800]     # x3 >= 800
]

constraints = [
    [1500,3000 ,'<=', 15000],   # x1 + x2 <= 2000
]

goal_programming(goals, constraints)
