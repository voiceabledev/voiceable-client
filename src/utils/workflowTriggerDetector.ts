/**
 * Detects which workflows should be triggered based on user message and workflow trigger phrases
 */

export interface WorkflowWithTriggers {
  id: number;
  trigger_phrases?: string[];
  workflow_name?: string;
}

export interface TriggerMatch {
  workflowId: number;
  matchedPhrase: string;
  workflowName?: string;
}

/**
 * Detects workflow triggers in a user message
 * @param message - The user's message to analyze
 * @param workflows - Array of workflows with trigger phrases
 * @returns Array of matching workflows with the matched phrase
 */
export function detectWorkflowTriggers(
  message: string,
  workflows: WorkflowWithTriggers[]
): TriggerMatch[] {
  if (!message || !workflows || workflows.length === 0) {
    return [];
  }

  const matches: TriggerMatch[] = [];
  const normalizedMessage = message.toLowerCase().trim();

  workflows.forEach((workflow) => {
    const triggerPhrases = workflow.trigger_phrases || [];
    
    if (triggerPhrases.length === 0) {
      return; // Skip workflows without trigger phrases
    }

    // Check each trigger phrase
    for (const phrase of triggerPhrases) {
      if (!phrase || typeof phrase !== 'string') {
        continue;
      }

      const normalizedPhrase = phrase.toLowerCase().trim();
      
      // Support partial matches - phrase appears anywhere in the message
      if (normalizedMessage.includes(normalizedPhrase)) {
        matches.push({
          workflowId: workflow.id,
          matchedPhrase: phrase,
          workflowName: workflow.workflow_name,
        });
        break; // Only match once per workflow
      }
    }
  });

  return matches;
}

/**
 * Highlights trigger phrases in a message
 * @param message - The original message
 * @param matches - Array of trigger matches
 * @returns Array of text segments with highlight information
 */
export function highlightTriggerPhrases(
  message: string,
  matches: TriggerMatch[]
): Array<{ text: string; isHighlighted: boolean; workflowId?: number }> {
  if (matches.length === 0) {
    return [{ text: message, isHighlighted: false }];
  }

  // Get all matched phrases (case-insensitive)
  const matchedPhrases = matches.map((m) => m.matchedPhrase.toLowerCase());
  
  // Simple highlighting: find and mark matched phrases
  const segments: Array<{ text: string; isHighlighted: boolean; workflowId?: number }> = [];
  let remainingMessage = message;
  let lastIndex = 0;

  // Find all occurrences of matched phrases
  const occurrences: Array<{ start: number; end: number; workflowId: number }> = [];
  
  matchedPhrases.forEach((phrase, idx) => {
    const workflowId = matches[idx].workflowId;
    let searchIndex = 0;
    
    while (true) {
      const index = remainingMessage.toLowerCase().indexOf(phrase, searchIndex);
      if (index === -1) break;
      
      occurrences.push({
        start: index,
        end: index + phrase.length,
        workflowId,
      });
      
      searchIndex = index + 1;
    }
  });

  // Sort by start position
  occurrences.sort((a, b) => a.start - b.start);

  // Build segments
  let currentIndex = 0;
  occurrences.forEach((occ) => {
    // Add text before match
    if (occ.start > currentIndex) {
      segments.push({
        text: remainingMessage.substring(currentIndex, occ.start),
        isHighlighted: false,
      });
    }

    // Add highlighted match
    segments.push({
      text: remainingMessage.substring(occ.start, occ.end),
      isHighlighted: true,
      workflowId: occ.workflowId,
    });

    currentIndex = occ.end;
  });

  // Add remaining text
  if (currentIndex < remainingMessage.length) {
    segments.push({
      text: remainingMessage.substring(currentIndex),
      isHighlighted: false,
    });
  }

  return segments.length > 0 ? segments : [{ text: message, isHighlighted: false }];
}
