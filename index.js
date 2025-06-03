// Wrapping the whole extension in a JS function and calling it immediately 
// (ensures all global variables set in this extension cannot be referenced outside its scope)
(async function(codioIDE, window) {
  
  // Refer to Anthropic's guide on system prompts: https://docs.anthropic.com/claude/docs/system-prompts
  const systemPrompt = `You are an experienced programming instructor tasked with providing constructive feedback on student code submissions. 
Your goal is to help students improve their programming skills by offering detailed, encouraging, and helpful assessments of their work.

Important: The code provided has already been confirmed to be correct and passes all test cases. 
Your task is to focus on code quality, readability, efficiency, and potential improvements rather than correctness.

Note: If there is a code comment similar to "Write your code here", the actual student submission starts from there. 

**Output Format Instruction:**

Provide your feedback using the following structure:
Overall Assessment:
[Provide a brief overall assessment of the code submission. 
Highlight its strengths and mention the main areas for improvement. 
Remember to be encouraging and constructive.]

Notes:
[Offer short comments on specific sections of the code. 
Use line numbers or code snippets to reference particular parts. 
Explain what's good about certain implementations and what could be improved. 
Be sure to provide reasoning behind your observations.]

Suggestions:
[Provide concrete suggestions for improving the code. This could include:
- Alternative approaches to certain problems
- Ways to make the code more efficient or readable
- Suggestions for better code organization or structure]`
    
  codioIDE.onErrorState(async (isError, error) => {
    console.log('codioIDE.onErrorState', {isError, error})

    if (!isError) {
      codioIDE.coachBot.showTooltip("Well done! Click here for more feedback on your code...", () => {
        codioIDE.coachBot.open({id: "codeFeedbackButton", params: "tooltip"})
      })
    }
  })

  // register(id: unique button id, name: name of button visible in Coach, function: function to call when button is clicked) 
  codioIDE.coachBot.register("codeFeedbackButton", "Test Custom Code Feedback", onButtonPress)

  async function onButtonPress(params) {
    // Function that automatically collects all available context 
    // returns the following object: {guidesPage, assignmentData, files, error}

    let context = await codioIDE.coachBot.getContext()
    console.log("Extra context", context)

    // Define your assistant's userPrompt - this is where you will provide all the context you collected along with the task you want the LLM to generate text for.
    const userPrompt = `Here's the assignment text that describes the problem the student was asked to solve:

<assignment_text>
${context.guidesPage.content}
</assignment_text>

Now, here's the student's code submission:

<student_code>
File name: ${context.files[0].path}
File content: ${context.files[0].content}
</student_code>

Provide your feedback in the outlined format addressing the student as "you".

Remember:
- Be constructive and encouraging in your feedback.
- Provide specific examples or code snippets when suggesting improvements.
- Balance positive feedback with areas for improvement.
- Tailor your feedback to the apparent skill level of the student based on their code.
- Focus on helping the student improve their programming skills beyond just solving the immediate problem.
- Keep your feedback brief and concise.`

    const result = await codioIDE.coachBot.ask({
      systemPrompt: systemPrompt,
      messages: [
        {
          "role": "user", 
          "content": userPrompt
        }
      ]
    })
    
  }

})(window.codioIDE, window)