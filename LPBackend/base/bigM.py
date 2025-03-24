from traceback import print_tb
import numpy as np
np.set_printoptions(precision=2, suppress=True)
def formulateConstraints(objective, objective_type, constraints,unrestricted_vars=[]):
    num_vars = len(objective)
    var_names = ['x' + str(i) for i in range(1, num_vars + 1)]
    for i in unrestricted_vars:
        var_name = var_names[i]
        var_names[i] = var_name + 'e'
        var_names.insert(i + 1, var_name + 's')
        for j in range(0,len(unrestricted_vars)):
            unrestricted_vars[j] += 1
        for constraint in constraints:
            constraint[i] = constraint[i] * -1
            constraint.insert(i , -1 * constraint[i])
        objective[i] = objective[i] * -1
        objective.insert(i, -1 * objective[i])
    num_constraints = len(constraints)
    M = 1e6
    tableau = []
    steps = []
    new_constraints = []
    if objective_type == 'max':
        print("maxxxx")
        objective = [-1 * x for x in objective]
    else:
        M = -1 * M
    
    for i, constraint in enumerate(constraints):
        if constraint[-2] == '<=':
            for j, constraint2 in enumerate(constraints):
                if j != i:
                    constraints[j] = constraint2[:-2] + [0] + constraint2[-2:]
            constraints[i] = constraint[:-2] + [1] + constraint[-2:]
            objective = objective + [0]
            var_names = var_names + ['s' + str(i + 1)]
        elif constraint[-2] == '>=':
            for j, constraint2 in enumerate(constraints):
                if j != i:
                    constraints[j] = constraint2[:-2] + [0, 0] + constraint2[-2:]
            constraints[i] = constraint[:-2] + [-1, 1] + constraint[-2:]
            objective = objective + [0,M]
            var_names = var_names + ['e' + str(i + 1), 'a' + str(i + 1)]
            num_vars += 1
        else:
            for j, constraint2 in enumerate(constraints):
                if j != i:
                    constraints[j] = constraint2[:-2] + [0] + constraint2[-2:]
            constraints[i] = constraint[:-2] + [1] + constraint[-2:]
            objective = objective + [M]
            var_names = var_names + ['a' + str(i + 1)]
            num_vars += 1
    for constraint in constraints:
        new_constraints.append([i for i in constraint if type(i) != str])
    
    objective = objective + [0]
    var_names = var_names + ['RHS']
    return new_constraints, objective, var_names, M

def simplex(objective, constraints, var_names,M):
    print(var_names)
    tableau = []
    basic_vars = []
    non_basic_vars = []
    objective = np.array(objective)
    constraints = np.array(constraints)
   
    for i in range(len(var_names)):
        if var_names[i].startswith('a'):
            pivotCol = i
            for j in range(len(constraints)):
                if constraints[j][i] == 1:
                    pivotRow = j
                    objective = constraints[j] *-M + objective
                    break
    for name in var_names:
        if name.startswith('s') or name.startswith('a'):
            basic_vars.append(name)
        else:
            non_basic_vars.append(name)
    steps = []
    tableau.append(objective)
    for constraint in constraints:
        tableau.append(constraint)
    print(tableau)
    tableau = np.array(tableau,dtype=float)
    steps.append(np.copy(tableau))
    i= 0
    # Pivot Row Identification Fix
    while np.any(tableau[0,:-1] < 0):
        print(tableau)
        pivotCol = np.argmin(tableau[0, :-1])

        # Correct ratio calculation for unrestricted variables
        ratios = tableau[1:, -1] / tableau[1:, pivotCol]
        valid_ratios = np.where(ratios > 0, ratios, np.inf)
        if np.all(valid_ratios == np.inf):
            print("Unbounded")
            return steps, basic_vars , False
        pivotRow = np.argmin(valid_ratios) + 1  # Adjust for offset

        # Handle artificial variable removal
        leaving_var = basic_vars[pivotRow - 1]
        entering_var = var_names[pivotCol]

        if leaving_var.startswith('a'):
            basic_vars[pivotRow - 1] = entering_var
            non_basic_vars.remove(entering_var)
            non_basic_vars.append(leaving_var)
        else:
            non_basic_vars.remove(entering_var)
            non_basic_vars.append(leaving_var)
            basic_vars[pivotRow - 1] = entering_var

        # Normalize pivot row
        tableau[pivotRow] /= tableau[pivotRow, pivotCol]

        # Row reduction for other rows
        pivotRow_values = tableau[pivotRow, :]
        for i in range(len(tableau)):
            if i != pivotRow:
                tableau[i] -= tableau[i, pivotCol] * pivotRow_values

        steps.append(np.copy(tableau))
    with open('outputFile.txt','w') as f:
        f.write(str(var_names) + '\n')

        f.write(str(steps))
    print(basic_vars)
    return steps, basic_vars , True
if __name__ == '__main__':
    objective = [1,2,1]
    objective_type = 'max'
    constraints = [[1,1,1,'=',7],[2,-5,1,'>=',10]]
    unrestricted_vars = []
    constraints, objective, var_names, M = formulateConstraints(objective, objective_type, constraints,unrestricted_vars.copy())
    print(constraints)
    print(objective)
    steps , basic_vars , feasible= simplex(objective, constraints, var_names,M)
    steps = np.array(steps)  # Add this before the loop
    print(steps[-1])
    print("Objective Value:", steps[-1, 0, -1])
    for var, val in zip(basic_vars, steps[-1, 1:]):
        factor = 1
        # if var.endswith('s'):
        #     factor = -1
        print(f"{var}: {factor * val[-1]}")
