// Wrapping the whole extension in a JS function and calling it immediately 
// (ensures all global variables set in this extension cannot be referenced outside its scope)
(async function(codioIDE, window) {
  
  // Refer to Anthropic's guide on system prompts: https://docs.anthropic.com/claude/docs/system-prompts
  const systemPrompt = `You are a helpful assistant helping students by providing feedback on their code when provided with the assignment question text, and the student's code submission`
    
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
    const userPrompt = `Here is the description of the programming assignment the student is working on:

<assignment>
${context.guidesPage.content}
</assignment>

Here is the student's correct code submission:

<current_code>
${context.files[0]}
</current_code> 

With the available context, provide the student with qualitative feedback on their code.`

    // const result = await codioIDE.coachBot.ask({
    //   systemPrompt: systemPrompt,
    //   messages: [{"role": "user", "content": userPrompt}]
    // })
    
  }

})(window.codioIDE, window)