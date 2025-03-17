import numpy as np

TOL = 1e-10

def handleUrVariables(A, c, urVariables):
    numOfURVar = len(urVariables)

    # x^` and x^n
    if numOfURVar > 0:
        constraints, numOfVars = A.shape
        newA = np.zeros((constraints, numOfVars + numOfURVar))
        newc = np.zeros(numOfVars + numOfURVar)

        newA[:, :numOfVars] = A
        newc[:numOfVars] = c

        # Add urVariables to the tableau
        for i, idx in enumerate(urVariables):
            newA[:, numOfVars + i] = -A[:, idx]  
            newc[numOfVars + i] = -c[idx]  

        A = newA
        c = newc
        numOfVars += numOfURVar

    return A, c, numOfVars

def simplex(c, A, b, optimalityCondition, urVariables=[]):

    c = np.array(c)
    A = np.array(A)
    b = np.array(b)

    constraints, numOfVars = A.shape

    if urVariables:
        A, c, numOfVars = handleUrVariables(A, c, urVariables)

    # Create tableau
    tableau = np.hstack([A, np.eye(constraints), b.reshape(-1, 1)])
    c = np.hstack([c, np.zeros(constraints + 1)]) 
    if(optimalityCondition == "minimize"):
        tableau = np.vstack([tableau, c])
    else:
        tableau = np.vstack([tableau, -1 * c])

    # print("Initial Tableau:")
    # print(tableau)

    # Simplex algorithm
    while True:
        # Check for optimality
        if all(tableau[-1, :-1] >= -TOL):
            break

        # Find pivot column
        pivotCol = np.argmin(tableau[-1, :-1])

        
        if all(tableau[:-1, pivotCol] <= TOL):
            # print("Problem is unbounded")
            exit()

        # Find pivot row
        ratios = tableau[:-1, -1] / tableau[:-1, pivotCol]
        ratios[ratios <= TOL] = np.inf 
        pivotRow = np.argmin(ratios)

        # print("Pivot Column:", pivotCol)
        # print("Pivot Row:", pivotRow)
        # print("Pivot Element:", tableau[pivotRow, pivotCol])

        # Pivot operation
        pivot = tableau[pivotRow, pivotCol]
        tableau[pivotRow, :] /= pivot
        for i in range(constraints + 1):
            if i != pivotRow:
                tableau[i, :] -= tableau[i, pivotCol] * tableau[pivotRow, :]

        # print("Updated Tableau:")
        # print(tableau)

    # Solution
    solution = np.zeros(numOfVars)
    for i in range(numOfVars):
        col = tableau[:, i]
        if sum(col == 1) == 1 and sum(col) == 1:  
            solution[i] = tableau[np.where(col == 1)[0][0], -1]

    # Solution incase urVariables
    if urVariables:
        for i, idx in enumerate(urVariables):
            solution[idx] = solution[idx] - solution[numOfVars - len(urVariables) + i]
    solution = solution[:numOfVars - len(urVariables)]

    if(optimalityCondition == "minimize" and tableau[-1, -1] != 0):
        objectiveValue = -1 * tableau[-1, -1]
    else:    
        objectiveValue = tableau[-1, -1]
    
    return solution, objectiveValue

# Test Case
# c = [-1, -1]
# A = [[2, 3], [-3, 2], [3, -5]]
# b = [12, -4, 2]

# urVariables = [0]

# solution, objectiveValue = simplex(c, A, b, "minimize", urVariables)
# print("Solution:", solution)
# print("Optimal Value:", objectiveValue)