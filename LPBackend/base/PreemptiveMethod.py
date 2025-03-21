import numpy as np

from GoalProgHelper import modify_matrices, priority, create_objective_functions
from SimplexMethod import simplex

# ==========================
#   INTEGRATION FUNCTION
# ==========================

# import numpy as np
# from scipy.optimize import linprog

# def solve_goal_programming(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, weights=None):
#     regular_coeffs = np.array(regular_coeffs)
#     regular_RHS = np.array(regular_RHS)
#     goal_coeffs = np.array(goal_coeffs)
#     goal_RHS = np.array(goal_RHS)

#     num_regular_constraints, num_regular_variables = regular_coeffs.shape
#     num_goal_constraints, num_goal_variables = goal_coeffs.shape

#     num_deviation_variables = num_goal_constraints * 2  # Two deviations per goal
    
#     num_total_constraints = num_regular_constraints + num_goal_constraints
#     num_total_variables = num_regular_variables + num_goal_variables + num_deviation_variables  # Include deviations
    
#     # Initialize the new coefficients matrix
#     total_coefficients = np.zeros((num_total_constraints, num_total_variables))
#     # Fill in the regular constraints
#     total_coefficients[:num_regular_constraints, :num_regular_variables] = regular_coeffs
#     # Fill in the goal constraints
#     total_coefficients[num_regular_constraints:, :num_goal_variables] = goal_coefficients
#     # Add identity matrix for deviation variables
#     total_coefficients[num_regular_constraints:, -num_deviation_variables:] = np.eye(num_deviation_variables)

#     total_RHS = np.concatenate([regular_RHS, goal_RHS])

#     if result.success:
#         return result.x, result.fun
#     else:
#         raise ValueError(f"Optimization failed: {result.message}")







# from scipy.optimize import linprog
# import numpy as np

# def solve_goal_programming(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, weights=None, priorities=None, optimization_direction='min'):
#     # Step 1: Translate constraints and goals into the correct format
#     full_coefficients, full_RHS, deviation_indices = translate_to_goals(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS)
    
#     # Step 2: Order goals based on priorities if using preemptive goal programming
#     goal_order = order_goals(priorities) if priorities is not None else None
    
#     # Step 3: Create the objective function(s)
#     objective_functions = create_objective_functions(goal_RHS, weights, priorities)
    
#     # Step 4: Solve the goal programming problem
#     results = []
#     for obj_func in objective_functions:
#         # Pad the objective function to match the number of variables
#         full_objective = np.zeros(full_coefficients.shape[1])
#         full_objective[deviation_indices] = obj_func
        
#         # Solve the linear programming problem
#         result = linprog(c=full_objective, A_eq=full_coefficients, b_eq=full_RHS, method='highs')
#         results.append(result)
    
#     return results


def solve_goal_programming(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, weights=None):
    num_vars = len(regular_coeffs[0])
    
    deviation_vars = 2 * len(goal_RHS)
    total_vars = num_vars + deviation_vars
    
    A = np.zeros((len(regular_coeffs) + len(goal_coeffs), total_vars))
    b = np.array(regular_RHS + goal_RHS)
    c = np.zeros(total_vars)

    for i, row in enumerate(regular_coeffs):
        A[i, :num_vars] = row

    for i, row in enumerate(goal_coeffs):
        A[len(regular_coeffs) + i, :num_vars] = row
        A[len(regular_coeffs) + i, num_vars + 2*i] = -1
        A[len(regular_coeffs) + i, num_vars + 2*i + 1] = 1

    if weights:
        for i, weight in enumerate(weights):
            c[num_vars + 2*i] = weight
            c[num_vars + 2*i + 1] = weight

    solution, objectiveValue = simplex(c, A, b, "minimize")
    return solution, objectiveValue

# ==========================
#   EXAMPLE USAGE
# ==========================
regular_coeffs = [[1, 2]]
regular_RHS = [10]

goal_coeffs = [[200, 0], [100, 400], [0, 250]]
goal_RHS = [1000, 1200, 800]

weights = [1, 2, 1]

solution, optimal_value = solve_goal_programming(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, weights)

print("Solution:", solution)
print("Optimal Value:", optimal_value)


# # Case 2: Priority-Based Objective Functions
# priorities = [3, 2, 1]  # G1 > G2 > G3
# solutions_case2, obj_values_case2 = solve_goal_programming(coeffecients, goal_values, priorities=priorities)

# print("\nCase 2 (Priority-Based Objective Functions):")
# for i, (sol, obj) in enumerate(zip(solutions_case2, obj_values_case2)):
#     print(f"Priority {i+1}: {sol}, Optimal Value: {obj}")