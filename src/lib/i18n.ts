import { Language } from './types';

export const translations = {
  en: {
    appTitle: 'Smart Escape',
    appSubtitle: 'Interactive Evacuation Route Simulator',
    officialBadge: 'AI DevFest Simulation',
    importButton: 'Import JSON',
    loadSampleButton: 'Load Official Sample',
    resetButton: 'Reset to Initial State',
    exportPngButton: 'Export Map (PNG)',
    languageSwitch: 'বাংলা',
    langName: 'English',
    highContrast: 'High Contrast',
    on: 'ON',
    off: 'OFF',
    
    // Tools / Mode
    interactionMode: 'Interaction Tool',
    modeSelectStart: 'Select Start Location',
    modeToggleNode: 'Block / Unblock Node',
    modeToggleEdge: 'Block / Unblock Corridor',
    modeToggleExit: 'Close / Reopen Exit',
    
    modeSelectStartDesc: 'Click an unblocked room or junction on the map to set starting point.',
    modeToggleNodeDesc: 'Click a room or junction to toggle its blocked hazard state.',
    modeToggleEdgeDesc: 'Click a corridor or cost badge to toggle obstruction.',
    modeToggleExitDesc: 'Click an exit to open or close it.',

    // Route result
    routeAnalysis: 'Evacuation Route Analysis',
    statusSuccess: 'Optimal Route Identified',
    statusStartBlocked: 'Starting location blocked',
    statusNoRoute: 'No route available',
    promptSelectStart: 'Please select an unblocked room or junction to calculate evacuation path.',
    destinationExit: 'Target Exit',
    totalCost: 'Total Evacuation Cost',
    nodeSequence: 'Escape Sequence',
    corridorsTraversed: 'Corridors Used',

    // Building info
    buildingDetails: 'Building Information',
    nodesCount: 'Nodes',
    edgesCount: 'Corridors',
    roomsCount: 'Rooms',
    junctionsCount: 'Junctions',
    exitsCount: 'Exits',
    hazardsSummary: 'Active Hazards',
    blockedNodesCount: 'Blocked Nodes',
    blockedEdgesCount: 'Blocked Corridors',
    closedExitsCount: 'Closed Exits',

    // Legend
    legendTitle: 'Map Legend',
    legendRoom: 'Room (Startable)',
    legendJunction: 'Junction',
    legendExit: 'Emergency Exit',
    legendClosedExit: 'Closed Exit',
    legendBlockedNode: 'Hazard / Blocked Node',
    legendBlockedEdge: 'Obstructed Corridor',
    legendRoute: 'Evacuation Route',
    legendStart: 'Selected Start Location',

    // Modals / Alerts
    dropJsonHere: 'Drop building.json here or click to browse',
    validationError: 'Validation Error',
    fileLoadedSuccessfully: 'Building configuration loaded successfully',
    presetScenarios: 'Quick Scenarios (Mock Tests)',
    scenarioBaseline: '1. Baseline (Start R1)',
    scenarioBlockC2: '2. Block Junction C2 (R1 -> E2, cost 11)',
    scenarioCloseExits: '3. Close Exits E1 & E2 (No route)',
    scenarioStartR2: '4. Start Room R2 (cost 7)',
    scenarioBlockStart: '5. Block Start Node R1 (Starting location blocked)',
    scenarioUnavailableHint: 'These checks use the official sample IDs. Load the official sample to run unavailable ones.',

    // Accessibility / Help
    shortcutsHint: 'Tip: Click directly on map elements to interact according to selected tool.',
  },
  bn: {
    appTitle: 'স্মার্ট এস্কেপ',
    appSubtitle: 'ইন্টারেক্টিভ উদ্ধার রুট সিমুলেটর',
    officialBadge: 'এআই ডেভফেস্ট সিমুলেশন',
    importButton: 'JSON ইমপোর্ট',
    loadSampleButton: 'নমুনা ডাটা লোড',
    resetButton: 'প্রাথমিক অবস্থায় রিসেট',
    exportPngButton: 'ম্যাপ ডাউনলোড (PNG)',
    languageSwitch: 'English',
    langName: 'বাংলা',
    highContrast: 'হাই কনট্রাস্ট',
    on: 'চালু',
    off: 'বন্ধ',

    // Tools / Mode
    interactionMode: 'ইন্টারেকশন টুল',
    modeSelectStart: 'শুরুর স্থান নির্ধারণ',
    modeToggleNode: 'নোড ব্লক / আনব্লক',
    modeToggleEdge: 'করিডোর ব্লক / আনব্লক',
    modeToggleExit: 'প্রস্থান বন্ধ / উন্মুক্ত',

    modeSelectStartDesc: 'শুরু নির্ধারণ করতে ম্যাপের যেকোনো উন্মুক্ত রুম বা জাংশনে ক্লিক করুন।',
    modeToggleNodeDesc: 'রুম বা জাংশনের বিপদজনক অবস্থা টগল করতে ক্লিক করুন।',
    modeToggleEdgeDesc: 'করিডোর বা খরচের ব্যাজে ক্লিক করে পথ অবরুদ্ধ/উন্মুক্ত করুন।',
    modeToggleExitDesc: 'প্রস্থান ফটক বন্ধ বা পুনরায় খুলতে ক্লিক করুন।',

    // Route result
    routeAnalysis: 'উদ্ধার রুট বিশ্লেষণ',
    statusSuccess: 'সর্বোত্তম পথ চিহ্নিত হয়েছে',
    statusStartBlocked: 'Starting location blocked',
    statusNoRoute: 'No route available',
    promptSelectStart: 'উদ্ধার পথ হিসাব করতে অনুগ্রহ করে একটি উন্মুক্ত রুম বা জাংশন নির্বাচন করুন।',
    destinationExit: 'গন্তব্য প্রস্থান ফটক',
    totalCost: 'মোট নিষ্কাশন ব্যয়',
    nodeSequence: 'উদ্ধার নোড ক্রম',
    corridorsTraversed: 'ব্যবহৃত করিডোর',

    // Building info
    buildingDetails: 'ভবন পরিচিতি ও তথ্য',
    nodesCount: 'মোট নোড',
    edgesCount: 'করিডোর',
    roomsCount: 'রুম',
    junctionsCount: 'জাংশন',
    exitsCount: 'প্রস্থান ফটক',
    hazardsSummary: 'সক্রিয় বিপদসমূহ',
    blockedNodesCount: 'অবরুদ্ধ নোড',
    blockedEdgesCount: 'অবরুদ্ধ করিডোর',
    closedExitsCount: 'বন্ধ প্রস্থান',

    // Legend
    legendTitle: 'ম্যাপ সংকেত',
    legendRoom: 'রুম (শুরুযোগ্য)',
    legendJunction: 'জাংশন',
    legendExit: 'জরুরি প্রস্থান',
    legendClosedExit: 'বন্ধ প্রস্থান',
    legendBlockedNode: 'বিপদ / অবরুদ্ধ নোড',
    legendBlockedEdge: 'অবরুদ্ধ করিডোর',
    legendRoute: 'উদ্ধার পথ',
    legendStart: 'নির্বাচিত শুরুর স্থান',

    // Modals / Alerts
    dropJsonHere: 'building.json ফাইলটি এখানে টেনে আনুন অথবা ব্রাউজ করুন',
    validationError: 'বৈধতা যাচাইকরণ ত্রুটি',
    fileLoadedSuccessfully: 'বিল্ডিং কনফিগারেশন সফলভাবে লোড হয়েছে',
    presetScenarios: 'কুইক টেস্ট সিনারিও',
    scenarioBaseline: '১. বেসলাইন (শুরু R1)',
    scenarioBlockC2: '২. জাংশন C2 ব্লক (R1 -> E2, ব্যয় ১১)',
    scenarioCloseExits: '৩. প্রস্থান E1 ও E2 বন্ধ (রুট নেই)',
    scenarioStartR2: '৪. রুম R2 থেকে শুরু (ব্যয় ৭)',
    scenarioBlockStart: '৫. শুরুর নোড R1 ব্লক (শুরু অবরুদ্ধ)',
    scenarioUnavailableHint: 'এই পরীক্ষাগুলো অফিসিয়াল নমুনার আইডি ব্যবহার করে। অনুপলব্ধগুলো চালাতে অফিসিয়াল নমুনা লোড করুন।',

    // Accessibility / Help
    shortcutsHint: 'পরামর্শ: নির্বাচিত টুল অনুযায়ী পরিবর্তন করতে সরাসরি ম্যাপে ক্লিক করুন।',
  },
};
