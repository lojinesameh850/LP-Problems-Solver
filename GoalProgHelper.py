import numpy as np

def create_objective_functions(goal_RHS, weights=None, priorities=None):
    num_goals = len(goal_RHS)
    num_deviation_vars = 2 * num_goals  # Positive and negative deviation vars

    if weights is not None and priorities is None:
        objective_function = [0] * num_deviation_vars  # Only deviation vars should have weights
        for i in range(num_goals):
            objective_function[2 * i] = weights[i]  # Place weight in corresponding positive deviation column
        return [objective_function]
    
    elif priorities is not None and weights is None:
        sorted_indices = np.argsort(np.array(priorities))[::-1]  # Ensure highest priority first
        objective_functions = [None] * len(priorities)  # Maintain original order

        for rank, idx in enumerate(sorted_indices):  
            obj_func = [0] * num_deviation_vars
            obj_func[2 * idx] = -1  # Prioritizing positive deviations
            objective_functions[idx] = obj_func  # Assign correctly

        return objective_functions
    
    else:
        raise ValueError("Provide either weights (for Weighted GP) or priorities (for Preemptive GP).")

def modify_matrices(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, weights=None, priorities=None):
    regular_coeffs = np.array(regular_coeffs)
    regular_RHS = np.array(regular_RHS)
    goal_coeffs = np.array(goal_coeffs)
    goal_RHS = np.array(goal_RHS)

    num_reg_constraints, num_vars = regular_coeffs.shape if regular_coeffs.size > 0 else (0, goal_coeffs.shape[1])
    num_goal_constraints = goal_coeffs.shape[0]
    num_deviation_vars = 2 * num_goal_constraints  # Positive and negative deviations for each goal

    # Ensure correct shape of coefficient matrices
    if num_reg_constraints > 0:
        zero_padding = np.zeros((num_reg_constraints, num_deviation_vars))
        full_coeffs = np.hstack([regular_coeffs, zero_padding])
    else:
        full_coeffs = np.zeros((0, num_vars + num_deviation_vars))

    # Create deviation variable identity matrices
    deviation_vars = np.eye(num_goal_constraints)
    
    # Reorder deviation variables to maintain original structure
    goal_augmented = np.hstack([np.zeros((num_goal_constraints, num_vars)), deviation_vars, -deviation_vars])
    
    # Place goal coefficients correctly
    goal_augmented[:, :goal_coeffs.shape[1]] = goal_coeffs  # Ensuring x, y positions remain intact
    
    # Stack everything together
    full_coeffs = np.vstack([full_coeffs, goal_augmented])
    full_RHS = np.hstack([regular_RHS, goal_RHS])

    deviation_start = num_vars  # Deviation variables start after the original variables
    deviation_indices = list(range(deviation_start, deviation_start + num_deviation_vars))

    # Objective function update
    objective_functions = create_objective_functions(goal_RHS, weights, priorities)
    for obj_func in objective_functions:
        obj_func_padded = np.append(np.zeros(num_vars), obj_func)  # Ensure correct alignment
        full_coeffs = np.vstack([obj_func_padded, full_coeffs])
        full_RHS = np.insert(full_RHS, 0, 0)

    return full_coeffs, full_RHS, deviation_indices

def display_tableau(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, weights=None, priorities=None, title="Tableau"):
    np.set_printoptions(suppress=True, precision=4)  # Improve formatting
    full_coeffs, full_RHS, _ = modify_matrices(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, weights, priorities)
    
    print(f"\n{title}:")
    for row, val in zip(full_coeffs, full_RHS):
        formatted_row = np.where(np.abs(row) < 1e-10, 0, row)  # Remove -0 display issue
        formatted_val = 0 if abs(val) < 1e-10 else val
        print(" ".join(f"{x:8.2f}" for x in np.append(formatted_row, formatted_val)))  # Uniform spacing
    print()

# def solve_goal_programming(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, weights=None, priorities=None, optimization_direction='min'):
#     full_coefficients, full_RHS, deviation_indices = modify_matrices(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, weights, priorities)
#     results = []
#     for i in range(len(deviation_indices) // 2):
#         full_objective = np.zeros(full_coefficients.shape[1])
#         full_objective[deviation_indices] = 1
#         result = linprog(c=full_objective, A_eq=full_coefficients, b_eq=full_RHS, method='highs')
#         results.append(result)
#     return results

regular_coeffs = [[1, 2]]
regular_RHS = [10]

goal_coeffs = [[200, 0], [100, 400], [0, 250]]
goal_RHS = [1000, 1200, 800]

priorities = [1, 2, 3]
display_tableau(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, priorities=priorities)

# weights = [1, 2, 1]
# display_tableau(regular_coeffs, regular_RHS, goal_coeffs, goal_RHS, weights=weights)
