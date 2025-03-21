from time import sleep
import numpy as np
np.set_printoptions(precision=2, suppress=True)
def formulateTwoPhase(constraints,unrestricted_vars=[]):
    num_vars = len(constraints[0]) - 2
    num_constraints = len(constraints)
    var_names = []
    objective = []
    for i in range(num_vars):
        var_names.append('x' + str(i + 1))
    for i , constraint in enumerate(constraints):
        if constraint[-2] == '>=':
            for j , constraint2 in enumerate(constraints):
                if j != i:
                    constraints[j] = constraint2[:-2] + [0, 0] + constraint2[-2:]
            constraints[i] = constraint[:-2] + [-1, 1] + constraint[-2:]
            var_names = var_names + ['e' + str(i + 1), 'a' + str(i + 1)]
        if constraint[-2] == '<=':
            for j , constraint2 in enumerate(constraints):
                if j != i:
                    constraints[j] = constraint2[:-2] + [0] + constraint2[-2:]
            constraints[i] = constraint[:-2] + [1] + constraint[-2:]
            var_names = var_names + ['s' + str(i + 1)]
        if constraint[-2] == '=':
            var_names = var_names + ['a' + str(i + 1)]
            for j , constraint2 in enumerate(constraints):
                if j != i:
                    constraints[j] = constraint2[:-2] + [0] + constraint2[-2:]
            constraints[i] = constraint[:-2] + [1] + constraint[-2:]
    var_names = var_names + ['RHS']
    for var in var_names:
        if var.startswith('a'):
            objective.append(1)
        else:
            objective.append(0)
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
    new_constraints = []
    for constraint in constraints:
        list = []
        for i in constraint:
            if type(i) != str:
                list.append(i)
        new_constraints.append(list)
    constraints = new_constraints
    return constraints, objective, var_names
def TwoPhasesimplex(objective , constraints , var_names , M=1, unrestricted_vars=[]):
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
        tableau.append(constraint )
    tableau = np.array(tableau,dtype=float)
    steps.append(np.copy(tableau))
    i= 0
    # Pivot Row Identification Fix
    while np.any(tableau[0,:-1] < 0):
        print(tableau)
        sleep(1)
        pivotCol = np.argmin(tableau[0, :-1])

        # Correct ratio calculation for unrestricted variables
        ratios = tableau[1:, -1] / tableau[1:, pivotCol]
        valid_ratios = np.where(ratios > 0, ratios, np.inf)
        if np.all(valid_ratios == np.inf):
            print("Unbounded")
            exit()
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
    return steps, basic_vars , var_names
def Secondarysimplex(objective, constraints, basic_vars,var_names,objective_type='max'):
    if objective_type == 'max':
        objective = -objective
    tableau = []
    non_basic_vars = []
    objective = np.array(objective)
    constraints = np.array(constraints)
    steps = []
    tableau.append(objective)
    for constraint in constraints:
        tableau.append(constraint)
    tableau = np.array(tableau,dtype=float)
    steps.append(np.copy(tableau))
    i= 0
    print(tableau)
    # Pivot Row Identification Fix
    while np.any(tableau[0,:-1] < 0):
        for i,name in enumerate(var_names):
            if name in basic_vars and tableau[0][i] != 0:
                print(name)
                pivotCol = i
                print(f"pivot col is {pivotCol}")
                for j in range(len(constraints)):
                    if constraints[j][i] != 0:
                        pivotRow = j+1
                        tableau[0] = tableau[pivotRow] * -1*tableau[0][i]/tableau[pivotRow][i] + tableau[0]
                        print(tableau)
        print(tableau)
        sleep(1)
        pivotCol = np.argmin(tableau[0, :-1])
        # Correct ratio calculation for unrestricted variables
        ratios = tableau[1:, -1] / tableau[1:, pivotCol]
        valid_ratios = np.where(ratios > 0, ratios, np.inf)
        if np.all(valid_ratios == np.inf):
            print("Unbounded")
            exit()
        pivotRow = np.argmin(valid_ratios) + 1  # Adjust for offset

        # Handle artificial variable removal
        leaving_var = basic_vars[pivotRow - 1]
        entering_var = var_names[pivotCol]
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
    return steps, basic_vars
Finalobjective = [5,-4,6,-8]
unrestricted_vars = [0,1]
constraints = [[1,2,2,4,'<=',40],[2,-1,1,2,'<=',8],[4,-2,1,-1,'<=',10]]
constraints, objective, var_names = formulateTwoPhase(constraints,unrestricted_vars.copy())
print(unrestricted_vars)
for i in unrestricted_vars:
        print(f'i = {i}')
        Finalobjective[i] = Finalobjective[i] * -1
        print(Finalobjective[i])
        Finalobjective.insert(i, -1 * Finalobjective[i])
        for j in range(0,len(unrestricted_vars)):
            unrestricted_vars[j] += 1
steps, basic_vars , var_names = TwoPhasesimplex(objective, constraints, var_names)
final_tableau = steps[-1]
artificial_indices = [i for i, name in enumerate(var_names) if name.startswith('a')]
final_tableau = np.delete(final_tableau, artificial_indices, axis=1)
real_vars = []
for name in var_names:
    if name.startswith('a') or name.startswith('x'):
        pass
    else:
        Finalobjective.append(0)
for name in var_names:
    if name.startswith('a'):
        pass
    else:
        real_vars.append(name)
final_tableau[0] = Finalobjective
objective_type = 'max'
solution, basic_vars  = Secondarysimplex(final_tableau[0],final_tableau[1:],basic_vars,real_vars  , objective_type)
print(solution[-1])
print(solution[-1][0][-1])
for var,val in zip(basic_vars, solution[-1][1:]):
    print(f'{var} = {val[-1]}')
