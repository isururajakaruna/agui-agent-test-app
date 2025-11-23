#!/usr/bin/env node

/**
 * Structure Comparison Script
 * Compares two JSON files and reports structural differences level by level
 */

const fs = require('fs');
const path = require('path');

// Read the two files
const referencePath = path.join(__dirname, 'reference_docs', 'eval-reference-evalset.json');
const comparePath = path.join(__dirname, 'reference_docs', 'compare.evalset.json');

const reference = JSON.parse(fs.readFileSync(referencePath, 'utf-8'));
const compare = JSON.parse(fs.readFileSync(comparePath, 'utf-8'));

console.log('='.repeat(80));
console.log('STRUCTURE COMPARISON: LEVEL BY LEVEL ANALYSIS');
console.log('='.repeat(80));
console.log('');

/**
 * Compare structure at a given level
 */
function compareLevel(ref, cmp, level = 0, path = 'root') {
  const indent = '  '.repeat(level);
  const refKeys = Object.keys(ref || {}).sort();
  const cmpKeys = Object.keys(cmp || {}).sort();
  
  // Find differences
  const onlyInRef = refKeys.filter(k => !cmpKeys.includes(k));
  const onlyInCmp = cmpKeys.filter(k => !refKeys.includes(k));
  const common = refKeys.filter(k => cmpKeys.includes(k));
  
  if (onlyInRef.length > 0 || onlyInCmp.length > 0 || refKeys.length !== cmpKeys.length) {
    console.log(`${indent}📍 PATH: ${path}`);
    console.log(`${indent}${'─'.repeat(60)}`);
    
    if (refKeys.length !== cmpKeys.length) {
      console.log(`${indent}⚠️  Different number of properties: ${refKeys.length} (reference) vs ${cmpKeys.length} (compare)`);
    }
    
    if (onlyInRef.length > 0) {
      console.log(`${indent}❌ MISSING in compare (should exist):`);
      onlyInRef.forEach(key => {
        const value = ref[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`${indent}   - "${key}" (${type})`);
      });
    }
    
    if (onlyInCmp.length > 0) {
      console.log(`${indent}✅ EXTRA in compare (shouldn't exist):`);
      onlyInCmp.forEach(key => {
        const value = cmp[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`${indent}   - "${key}" (${type})`);
      });
    }
    
    if (common.length > 0) {
      console.log(`${indent}✔️  Common properties: ${common.join(', ')}`);
    }
    
    console.log('');
  }
  
  return { onlyInRef, onlyInCmp, common };
}

// Level 0: Top level
console.log('🔍 LEVEL 0: TOP LEVEL STRUCTURE');
console.log('─'.repeat(80));
const level0 = compareLevel(reference, compare, 0, 'root');
console.log('');

// Level 1: Inside eval_cases[0] vs compare (since compare IS an eval_case)
if (reference.eval_cases && reference.eval_cases.length > 0) {
  console.log('🔍 LEVEL 1: EVAL CASE STRUCTURE');
  console.log('─'.repeat(80));
  console.log('Comparing: reference.eval_cases[0] vs compare (entire object)');
  console.log('');
  const level1 = compareLevel(reference.eval_cases[0], compare, 0, 'eval_case');
  console.log('');
  
  // Level 2: Inside conversation array
  const refConv = reference.eval_cases[0].conversation;
  const cmpConv = compare.conversation;
  
  if (refConv && refConv.length > 0 && cmpConv && cmpConv.length > 0) {
    console.log('🔍 LEVEL 2: CONVERSATION ARRAY');
    console.log('─'.repeat(80));
    console.log(`Reference has ${refConv.length} invocation(s), Compare has ${cmpConv.length} invocation(s)`);
    console.log('Comparing first invocation structure:');
    console.log('');
    const level2 = compareLevel(refConv[0], cmpConv[0], 0, 'conversation[0]');
    console.log('');
    
    // Level 3: Inside invocation properties
    console.log('🔍 LEVEL 3: INVOCATION PROPERTIES');
    console.log('─'.repeat(80));
    
    // Compare user_content vs user_content
    if (refConv[0].user_content && cmpConv[0].user_content) {
      console.log('📍 user_content structure:');
      compareLevel(refConv[0].user_content, cmpConv[0].user_content, 1, 'conversation[0].user_content');
      console.log('');
    }
    
    // Compare final_response vs final_response
    if (refConv[0].final_response && cmpConv[0].final_response) {
      console.log('📍 final_response structure:');
      compareLevel(refConv[0].final_response, cmpConv[0].final_response, 1, 'conversation[0].final_response');
      console.log('');
    }
    
    // Compare intermediate_data vs intermediate_data
    if (refConv[0].intermediate_data && cmpConv[0].intermediate_data) {
      console.log('📍 intermediate_data structure:');
      compareLevel(refConv[0].intermediate_data, cmpConv[0].intermediate_data, 1, 'conversation[0].intermediate_data');
      console.log('');
      
      // Level 4: invocation_events
      const refEvents = refConv[0].intermediate_data.invocation_events;
      const cmpEvents = cmpConv[0].intermediate_data.invocation_events;
      
      if (refEvents && refEvents.length > 0 && cmpEvents && cmpEvents.length > 0) {
        console.log('🔍 LEVEL 4: INVOCATION EVENTS');
        console.log('─'.repeat(80));
        console.log(`Reference has ${refEvents.length} event(s), Compare has ${cmpEvents.length} event(s)`);
        console.log('Comparing first event structure:');
        console.log('');
        compareLevel(refEvents[0], cmpEvents[0], 1, 'invocation_events[0]');
        console.log('');
      }
    }
    
    // Compare session_input
    const refSession = reference.eval_cases[0].session_input;
    const cmpSession = compare.session_input;
    
    if (refSession && cmpSession) {
      console.log('📍 session_input structure:');
      compareLevel(refSession, cmpSession, 1, 'session_input');
      console.log('');
    }
  }
}

console.log('='.repeat(80));
console.log('END OF COMPARISON');
console.log('='.repeat(80));

