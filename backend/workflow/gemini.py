# To run this code you need to install the following dependencies:
# pip install google-genai

import base64
import os
# import base64
# import os
from google import genai
from google.genai import types
import json # For parsing
from copy import deepcopy # For safely modifying contents list
from dotenv import load_dotenv # Import load_dotenv

# Load environment variables from .env file
# This ensures GEMINI_API_KEY is loaded if the script is run directly or imported early.
load_dotenv()

model_name = "gemini-2.0-flash-lite" 

original_contents_template = [
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When someone checks in, send them a welcome email."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Send Email\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Guest checks in\",
      \"workflow_description\": \"Send a welcome email to the guest.\",
      \"workflow_name\": \"Welcome Email\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When a guest checks in, send a welcome email, send a Slack notification to the front-desk channel, and create a task to verify their ID."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Send Email\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Guest checks in\",
      \"workflow_description\": \"Send a welcome email to the guest.\",
      \"workflow_name\": \"Welcome Email\"
    },
    {
      \"action_name\": \"Send Slack Notification\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Guest checks in\",
      \"workflow_description\": \"Send a Slack notification to the front-desk channel.\",
      \"workflow_name\": \"Front Desk Notification\"
    },
    {
      \"action_name\": \"Create Task\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Guest checks in\",
      \"workflow_description\": \"Create a task to verify the guest's ID.\",
      \"workflow_name\": \"Verify ID Task\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When inventory is running low, create a reorder task; and when a booking is canceled, send a Slack notification to procurement.

"""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Create Task\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Inventory running low\",
      \"workflow_description\": \"Create a reorder task.\",
      \"workflow_name\": \"Create Reorder Task\"
    },
    {
      \"action_name\": \"Send Slack Notification\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Booking canceled\",
      \"workflow_description\": \"Send a Slack notification to procurement.\",
      \"workflow_name\": \"Notify Procurement\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text=""""When a maintenance issue is reported, send an email to the maintenance team, send a native notification to the property manager, and create a follow-up task in the system.""")
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Send Email\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Maintenance issue reported\",
      \"workflow_description\": \"Send an email to the maintenance team.\",
      \"workflow_name\": \"Notify Maintenance Team\"
    },
    {
      \"action_name\": \"Send Native Notification\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Maintenance issue reported\",
      \"workflow_description\": \"Send a native notification to the property manager.\",
      \"workflow_name\": \"Notify Property Manager\"
    },
    {
      \"action_name\": \"Create Task\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Maintenance issue reported\",
      \"workflow_description\": \"Create a follow-up task in the system.\",
      \"workflow_name\": \"Create Follow-up Task\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When a guest sends a message or a booking is canceled, send a Slack notification to support and send an email to accounting."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Send Slack Notification\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Guest Sends Message\",
      \"workflow_description\": \"Send a Slack notification to support.\",
      \"workflow_name\": \"Notify Support - Message\"
    },
    {
      \"action_name\": \"Send Email\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Guest Sends Message\",
      \"workflow_description\": \"Send an email to accounting.\",
      \"workflow_name\": \"Notify Accounting - Message\"
    },
    {
      \"action_name\": \"Send Slack Notification\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Booking canceled\",
      \"workflow_description\": \"Send a Slack notification to support.\",
      \"workflow_name\": \"Notify Support - Cancellation\"
    },
    {
      \"action_name\": \"Send Email\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Booking canceled\",
      \"workflow_description\": \"Send an email to accounting.\",
      \"workflow_name\": \"Notify Accounting - Cancellation\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When cleaning is completed, send an email summary to housekeeping, send a native notification to the operations manager, and create a final inspection task."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Send Email\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Cleaning completed\",
      \"workflow_description\": \"Send an email summary to housekeeping.\",
      \"workflow_name\": \"Housekeeping Summary\"
    },
    {
      \"action_name\": \"Send Native Notification\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Cleaning completed\",
      \"workflow_description\": \"Send a native notification to the operations manager.\",
      \"workflow_name\": \"Operations Manager Notification\"
    },
    {
      \"action_name\": \"Create Task\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Cleaning completed\",
      \"workflow_description\": \"Create a final inspection task.\",
      \"workflow_name\": \"Final Inspection Task\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When a guest checks out, create a cleaning task 2 hours later.
"""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Create Task\",
      \"delay_time\": 2,
      \"delay_unit\": \"hours\",
      \"rule_type\": \"scheduled\",
      \"trigger_name\": \"Guest checks out\",
      \"workflow_description\": \"Create a cleaning task.\",
      \"workflow_name\": \"Create Cleaning Task\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""After cleaning is completed, send a native notification 30 minutes later."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Send Native Notification\",
      \"delay_time\": 30,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"scheduled\",
      \"trigger_name\": \"Cleaning completed\",
      \"workflow_description\": \"Send a native notification.\",
      \"workflow_name\": \"Send Notification\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When inventory is running low, create a reorder task 1 day later."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Create Task\",
      \"delay_time\": 1,
      \"delay_unit\": \"days\",
      \"rule_type\": \"scheduled\",
      \"trigger_name\": \"Inventory running low\",
      \"workflow_description\": \"Create a reorder task.\",
      \"workflow_name\": \"Create Reorder Task\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When inventory is running low, send a native notification to the manager immediately and create a reorder task one day later."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Send Native Notification\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Inventory running low\",
      \"workflow_description\": \"Send a native notification to the manager.\",
      \"workflow_name\": \"Notify Manager\"
    },
    {
      \"action_name\": \"Create Task\",
      \"delay_time\": 1,
      \"delay_unit\": \"days\",
      \"rule_type\": \"scheduled\",
      \"trigger_name\": \"Inventory running low\",
      \"workflow_description\": \"Create a reorder task.\",
      \"workflow_name\": \"Create Reorder Task\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When a guest checks out, send a Slack notification to housekeeping immediately and schedule a deep-cleaning task 2 hours later."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Send Slack Notification\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Guest checks out\",
      \"workflow_description\": \"Send a Slack notification to housekeeping.\",
      \"workflow_name\": \"Housekeeping Notification\"
    },
    {
      \"action_name\": \"Create Task\",
      \"delay_time\": 2,
      \"delay_unit\": \"hours\",
      \"rule_type\": \"scheduled\",
      \"trigger_name\": \"Guest checks out\",
      \"workflow_description\": \"Schedule a deep-cleaning task.\",
      \"workflow_name\": \"Schedule Deep-Cleaning Task\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When a guest arrives, send a welcome email immediately."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"action_name\": \"Send Email\",
      \"delay_time\": 0,
      \"delay_unit\": \"minutes\",
      \"rule_type\": \"immediate\",
      \"trigger_name\": \"Guest checks in\",
      \"workflow_description\": \"Send a welcome email.\",
      \"workflow_name\": \"Welcome Email\"
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When Guest checks in, send a fax to the guest."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [
    {
      \"workflow_name\": \"Send Email\",
      \"workflow_description\": \"Send an email.\",
      \"trigger_name\": \"Booking canceled\",
      \"action_name\": \"Send Email\",
      \"rule_type\": \"scheduled\",
      \"delay_time\": 10,
      \"delay_unit\": \"minutes\"
    }
  ],
  \"errors\": [
    {
      \"workflow_index\": 0,
      \"issues\": [
        \"action_name "Send Fax" is not one of the allowed actions [Send Email, Send Slack Notification, Send Native Notification, Create Task, Turn Device On/Off]\",
        \"workflow_name "Send Fax" is tied to an invalid action\"
      ]
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""When Booking canceled, send an email 10 later."""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": [],
  \"errors\": [
    {
      \"workflow_index\": 0,
      \"issues\": [
        \"Ambiguous scheduling: '10 later' does not specify a time unit (minutes, hours, or days)\"
      ]
    }
  ]
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""blah blah blah"""),
        ],
    ),
    types.Content(
        role="model",
        parts=[
            types.Part.from_text(text="""{
  \"suggested_workflows\": []
}"""),
        ],
    ),
    types.Content(
        role="user",
        parts=[
            types.Part.from_text(text="""INSERT_INPUT_HERE"""),
        ],
    ),
]

# This is the generation config from your file.
# It's kept at module level to preserve its structure and for the new function to use.
generation_config_from_user_file = types.GenerateContentConfig(
    response_mime_type="application/json",
    response_schema=genai.types.Schema(
        type = genai.types.Type.OBJECT,
        required = ["suggested_workflows"],
        properties = {
            "suggested_workflows": genai.types.Schema(
                type = genai.types.Type.ARRAY,
                items = genai.types.Schema(
                    type = genai.types.Type.OBJECT,
                    required = ["workflow_name", "workflow_description", "trigger_name", "action_name", "rule_type", "delay_time", "delay_unit"],
                    properties = {
                        "workflow_name": genai.types.Schema(type = genai.types.Type.STRING,),
                        "workflow_description": genai.types.Schema(type = genai.types.Type.STRING,),
                        "trigger_name": genai.types.Schema(type = genai.types.Type.STRING,),
                        "action_name": genai.types.Schema(type = genai.types.Type.STRING,),
                        "rule_type": genai.types.Schema(type = genai.types.Type.STRING, enum = ["immediate", "scheduled"],),
                        "delay_time": genai.types.Schema(type = genai.types.Type.NUMBER,),
                        "delay_unit": genai.types.Schema(type = genai.types.Type.STRING, enum = ["minutes", "hours", "days"],),
                    },
                ),
            ),
            "errors": genai.types.Schema(
                type=genai.types.Type.ARRAY,
                items=genai.types.Schema(
                    type=genai.types.Type.OBJECT,
                    properties={
                        "workflow_index": genai.types.Schema(type=genai.types.Type.NUMBER),
                        "issues": genai.types.Schema(type=genai.types.Type.ARRAY, items=genai.types.Schema(type=genai.types.Type.STRING))
                    }
                )
            )
        },
    ),
    system_instruction=[
        types.Part.from_text(text="""System: You are an AI assistant that generates structured workflow suggestions.

You must obey these rules on every request:
	1.	Valid Triggers (must match exactly):
	•	Guest checks in
	•	Guest checks out
	•	Cleaning completed
	•	Maintenance issue reported
	•	Booking canceled
	•	Inventory running low
	•	Guest Sends Message
	•	New Booking Confirmed
	•	Smart Device Alert
	2.	Valid Actions (must match exactly):
	•	Send Email
	•	Send Slack Notification
	•	Send Native Notification
	•	Create Task
	•	Turn Device On/Off
	3.	Output Schema:
Always return exactly one JSON object matching this JSON-Schema:

{
  \"type\": \"object\",
  \"properties\": {
    \"suggested_workflows\": {
      \"type\": \"array\",
      \"items\": {
        \"type\": \"object\",
        \"properties\": {
          \"workflow_name\":        { \"type\": \"string\" },
          \"workflow_description\": { \"type\": \"string\" },
          \"trigger_name\":         { \"type\": \"string\" },
          \"action_name\":          { \"type\": \"string\" },
          \"rule_type\": {
            \"type\": \"string\",
            \"enum\": [\"immediate\",\"scheduled\"]
          },
          \"delay_time\": { \"type\": \"number\" },
          \"delay_unit\": {
            \"type\": \"string\",
            \"enum\": [\"minutes\",\"hours\",\"days\"]
          }
        },
        \"required\": [
          \"workflow_name\",
          \"workflow_description\",
          \"trigger_name\",
          \"action_name\",
          \"rule_type\",
          \"delay_time\",
          \"delay_unit\"
        ]
      }
    }
  },
  \"required\": [\"suggested_workflows\"]
}


	4.	Field Semantics:
	•	If rule_type is \"immediate\", then delay_time must be 0 and delay_unit can be an empty string (\"\").
	•	If rule_type is \"scheduled\", delay_time must be a positive integer and delay_unit one of \"minutes\", \"hours\", or \"days\".
	5.	No Extra Keys or Commentary
	•	Do not wrap in markdown.
	•	Do not include any explanatory text.
	•	Do not invent triggers or actions beyond the lists above.
	•	Do not include any fields other than the seven listed.

When the user gives a natural-language description of a desired automation, produce only the JSON object described above, filling in valid trigger/action names and scheduling fields."""),
    ],
)
# --- End of User's existing model, contents, and config ---


def get_ai_suggestions_for_prompt(user_prompt_text: str) -> str | None:
    """
    Sends the user prompt to the Gemini model using the pre-defined fine-tuning
    examples and configuration.

    Args:
        user_prompt_text: The natural language prompt from the user.

    Returns:
        A JSON string from the AI if successful, otherwise None.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set in gemini.py.")
        return None

    try:
        client = genai.Client(api_key=api_key) # As per user's original code

        # Deep copy the module-level contents template to safely insert the user prompt
        final_contents = deepcopy(original_contents_template)
        
        # The last Content object in the template is the placeholder
        if final_contents and \
           len(final_contents) > 0 and \
           final_contents[-1].role == "user" and \
           len(final_contents[-1].parts) > 0 and \
           final_contents[-1].parts[0].text == "INSERT_INPUT_HERE":
            
            final_contents[-1].parts[0] = types.Part.from_text(text=user_prompt_text)
        else:
            # This case should ideally not be reached if the template is structured as expected.
            print("Error: Could not find or replace the 'INSERT_INPUT_HERE' placeholder in gemini.py contents template.")
            # Fallback: append as a new user message if placeholder logic failed,
            # though this deviates from strict replacement of the placeholder.
            # For safety, returning None is better if the template isn't right.
            return None

        # Accumulate streamed response text
        # Using client.models.generate_content_stream as in user's original code
        full_response_text = ""
        # The model name and config are taken from the module-level variables defined above,
        # which mirror the user's original `gemini.py` structure.
        for chunk in client.models.generate_content_stream( # client.models.generate_content_stream is from user's code
            model=model_name, 
            contents=final_contents,
            config=generation_config_from_user_file, 
        ):
            if hasattr(chunk, 'text') and chunk.text: # Ensure chunk.text exists
                full_response_text += chunk.text
        
        if not full_response_text.strip():
            print("Error: AI response was empty or contained no text.")
            return None
            
        return full_response_text.strip()

    except Exception as e:
        # It's good practice to log the actual exception
        import traceback
        print(f"Error during Gemini API call in gemini.py: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return None

# Commenting out the original generate function and if __name__ == "__main__": block
# def generate():
#     client = genai.Client(
#         api_key=os.environ.get("GEMINI_API_KEY"),
#     )
# 
#     model = "gemini-1.5-flash-latest" # This was in user's generate()
#     # ... rest of the original generate() function ...
# 
# if __name__ == "__main__":
#     generate()
