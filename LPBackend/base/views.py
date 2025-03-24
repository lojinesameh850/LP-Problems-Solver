import json
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from flask import jsonify
import numpy
from .SecondPreemptive import *
from .bigM import formulateConstraints , simplex
from .TwoPhase import  Secondarysimplex , TwoPhasesimplex , formulateTwoPhase
# Create your views here.
@method_decorator(csrf_exempt, name='dispatch')
class Solver(View):
    def get(self,request : HttpRequest):
        return HttpResponse("Hello")
    def post(self ,request : HttpRequest):
        data = json.loads(request.body.decode('utf-8'))  # Decode and parse JSON
        print(data)  # Debugging output
        # Extract data
        operation = data.get('operation')
        if operation in {1,2}:
            print("here")
            objective = data.get('objective')
            constraints = data.get('constraints')
            objective_type = data.get('objective_type')
            unrestricted_vars = data.get('unrestricted_vars')
            constraints, objective, var_names, M = formulateConstraints(objective, objective_type, constraints,unrestricted_vars.copy())
            steps , basic_vars , feasible= simplex(objective, constraints, var_names.copy(),M)
            # for name in basic_vars:
            #     if name.startswith('a'):
            #         feasible = False
            #         break
            # Convert NumPy arrays to lists
            if isinstance(steps, numpy.ndarray):
                steps = steps.tolist()
            if isinstance(basic_vars, numpy.ndarray):
                basic_vars = basic_vars.tolist()
            #if steps contains nested ndarrays
            if isinstance(steps,list):
                new_steps = []
                for item in steps:
                    if isinstance(item, numpy.ndarray):
                        new_steps.append(item.tolist())
                    else:
                        new_steps.append(item)
                steps = new_steps
            print(steps)
            return JsonResponse({
                "steps": steps,
                "basic_vars": basic_vars,
                "feasible" : feasible,
                "var_names" : var_names
            })
        elif operation == 3:
            objective = data.get('objective')
            constraints = data.get('constraints')
            objective_type = data.get('objective_type')
            unrestricted_vars = data.get('unrestricted_vars')
            Finalobjective = objective
            constraints , objective , var_namesOld= formulateTwoPhase(constraints,unrestricted_vars.copy())
                
            for i in unrestricted_vars:
                Finalobjective[i] = Finalobjective[i] * -1
                Finalobjective.insert(i, -1 * Finalobjective[i])
                for j in range(0,len(unrestricted_vars)):
                    unrestricted_vars[j] += 1
            steps , basic_vars , var_names ,feasible= TwoPhasesimplex(objective,constraints,var_namesOld.copy())
            for name in basic_vars:
                if name.startswith('a'):
                    feasible = False
                    break
            if not feasible: 
                if isinstance(steps,numpy.ndarray):
                    steps = steps.tolist()
                if isinstance(steps,list):
                    new_steps = []
                    for item in steps:
                        if isinstance(item, numpy.ndarray):
                            new_steps.append(item.tolist())
                        else:
                            new_steps.append(item)
                    steps = new_steps
                return JsonResponse({
                    "steps" : steps,
                    "var_names" : var_names,
                    "basic_vars" :basic_vars,
                    "feasible" : feasible,
                    "old_names" : var_namesOld
                })
            final_tableau = steps[-1]
            artificial_indices = [i for i, name in enumerate(var_names) if name.startswith('a')]
            final_tableau = numpy.delete(final_tableau, artificial_indices, axis=1)
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
            solution, basic_vars, feasible  = Secondarysimplex(final_tableau[0],final_tableau[1:],basic_vars,real_vars , objective_type)
            for name in basic_vars:
                if name.startswith('a'):
                    feasible = False
                    break
            if isinstance(steps,numpy.ndarray):
                steps = steps.tolist()
            if isinstance(steps,list):
                new_steps = []
                for item in steps:
                    if isinstance(item, numpy.ndarray):
                        new_steps.append(item.tolist())
                    else:
                        new_steps.append(item)
                steps = new_steps
            if isinstance(solution,numpy.ndarray):
                solution = solution.tolist()
            if isinstance(solution,list):
                new_solution = []
                for item in solution:
                    if isinstance(item, numpy.ndarray):
                        new_solution.append(item.tolist())
                    else:
                        new_solution.append(item)
                solution = new_solution
            return JsonResponse({
                "steps" : solution,
                "solution" : steps,
                "basic_vars" : basic_vars,
                "old_names" : var_names,
                "feasible" : feasible,
                "var_names" : real_vars
            })
        elif operation == 4:
            goals = data.get("goals")
            unrestricted_vars = data.get("unrestricted_vars")
            num_constraints = data.get("num_constraints")
            goals , var_names , satisfier = FormulatePreemptive(goals,unrestricted_vars.copy())
            basic_vars , var_names , steps , feasible = solvePreemtpive(goals,var_names,satisfier,num_constraints)
            return JsonResponse(
                {
                    "steps" : steps,
                    "var_names" : var_names,
                    "basic_vars" : basic_vars,
                    "feasible" : feasible
                }
            )
            


    