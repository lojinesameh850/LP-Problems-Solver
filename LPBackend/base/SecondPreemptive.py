import time
import numpy as np
np.set_printoptions(2,suppress=True)
def FormulatePreemptive(goals,unrestricted = []):
    satisfier = []
    var_names = []
    for i in range(len(goals[0])-2):
        var_names.append('x'+str(i+1))
    for i in unrestricted:
        name = var_names[i]
        var_names[i] = var_names[i]+str('e')
        var_names.insert(i+1,name+str('s'))
        for j , goal in enumerate(goals):
            goals[j][i] = -1 * goal[i]
            goals[j].insert(i+1,-1*goal[i])
        for j in range(i,len(unrestricted)):
            unrestricted[j] +=1
    for i,goal in enumerate(goals):
        var_names.append(str('e') + str(i+1))
        var_names.append(str('s') + str(i+1))
        goal.insert(-2,-1)
        goal.insert(-2,1)
        for j , goal2 in enumerate(goals):
            if not np.array_equal(goal,goal2):
                goals[j].insert(-2,0)
                goals[j].insert(-2,0)
    var_names.append('RHS')
    for i , goal in enumerate(goals):
        list = []
        if goal[-2] == '<=':
            list.append('e'+str(i+1))
        elif goal[-2] =='>=':
            list.append('s'+str(i+1))
        else:
            list.append('e'+str(i+1))
            list.append('s'+str(i+1))
        satisfier.append(list)
            
             
    list = []
    for goal in goals:
        new_goal =[]
        for element in goal:
            if not type(element) == str:
                new_goal.append(element)
        list.append(new_goal)
    return list,var_names,satisfier
# def formulateConstraints(constraints,var_names,objectives , goals):
#     for i ,constraint in enumerate(constraints):
#         if constraint[-2] == '<=':
#             for j , constraint2 in enumerate(constraints):
#                 if j!=i:
#                     constraints[j] = constraint2[:-2] + [0] + constraint2[-2:]
#                 constraints[i] = constraint[:-2] + [1] + constraint[-2:]
#             for j, objective in enumerate(objectives):
#                 objectives[j].insert(-2,0)
#         elif 
def solvePreemtpive(goals,var_names,satisfier,num_constraints = 0):
    list = []
    objectives = []
    satisfaction = []
    basic_vars = []
    for name in var_names:
        if name.startswith('s'):
            basic_vars.append(name)
    for i, sat in enumerate(satisfier):
        objective = []
        for var in var_names:
            if var in sat:
                objective.append(-1)
            else:
                objective.append(0)
        objectives.append(objective)
    objectives = np.array(objectives,dtype=float)
    goals = np.array(goals,dtype=float)
    print(var_names)
    print(objectives)
    print(goals)
    for i, objective in enumerate(objectives):
        for j, name in enumerate(var_names):
            if name.startswith('s') and objective[j] != 0:
                objectives[i] += goals[i] 
    list.append(np.vstack([objectives,goals]).tolist())
    for i,objective in enumerate(objectives):
        while np.any(objective[:-1] > 0):
            list.append(np.vstack([objectives,goals]).tolist())
            pivotCol = np.argmax(objective[:-1])
            if i!=0:
                print(objectives[:i,pivotCol])
                if np.any(objectives[:i, pivotCol] != 0):
                    print(f"goal {i+1} conflicts with a higher priority goal")
                    if i < num_constraints:
                        return basic_vars, var_names,list , False
                    break
            ratios = goals[:,-1] / goals[:,pivotCol]
            valid_ratios = np.where(ratios > 0, ratios, np.inf)
            if np.all(valid_ratios == np.inf):
                print("unbounded")
                if i  < num_constraints:
                    return basic_vars , var_names , list , False
                break
            pivotRow = np.argmin(valid_ratios)
            entering_var = var_names[pivotCol]
            print(entering_var)
            basic_vars[pivotRow] = entering_var
            goals[pivotRow] /= goals[pivotRow,pivotCol]
            pivotRow_values = goals[pivotRow , :]
            for k in range(len(objectives)):
                objectives[k] = goals[pivotRow] *-1* objectives[k,pivotCol] / goals[pivotRow,pivotCol] + objectives[k]
            for k in range(len(goals)):
                if k!=pivotRow:
                    goals[k] = goals[pivotRow] *-1* goals[k,pivotCol] / goals[pivotRow,pivotCol] + goals[k]
    return basic_vars, var_names,list , True
            
                

if __name__ == "__main__":
    goals = [
        [1500,3000,'<=',15000], 
        [ 0,250,'>=', 800] ,
        [100,400, '>=', 1200],
        [200,0, '>=', 1000],  
    ]
    goals ,var_names , satisfier = FormulatePreemptive(goals)
    basic_vars, var_names, list = solvePreemtpive(goals,var_names,satisfier)
    print(basic_vars)
    print(var_names)
    finalStep = list[-1]
    finalStep = np.array(finalStep)
    finalStep = finalStep[-1*len(goals):]
    print(finalStep)
    for i,name in enumerate(basic_vars):
        print(f"{name} = {finalStep[i,-1]}")

