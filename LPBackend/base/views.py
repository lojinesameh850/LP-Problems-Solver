import json
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from flask import jsonify
import numpy
from .bigM import formulateConstraints , simplex
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
        objective = data.get('objective')
        constraints = data.get('constraints')
        objective_type = data.get('operation_type')
        unrestricted_vars = data.get('unrestricted_vars')
        if operation == 2:
            constraints , objective , var_names , M = formulateConstraints(objective,objective_type,constraints,unrestricted_vars.copy())
            steps , basic_vars = simplex(objective,constraints,var_names,M)
            print(type(steps))
            print(type(basic_vars))
            if isinstance(basic_vars, str):
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
                return JsonResponse({
                    "steps": steps,
                    "Error": basic_vars
                })
            else:
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

                return JsonResponse({
                    "steps": steps,
                    "basic_vars": basic_vars
                })
    