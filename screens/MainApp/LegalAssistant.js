// import React, { useState, useEffect } from "react";
// import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Constants from 'expo-constants';
// import { theme } from '../../constants/colors';
// import { MessageCircle } from 'lucide-react-native';
// import { BlurView } from 'expo-blur';
// import { LinearGradient } from 'expo-linear-gradient';
// import BackButton from '../../components/UI/BackButton';
// import { supabase } from '../../services/supabaseClient';
// import { useNavigation } from '@react-navigation/native';

// const { GEMINI_API_KEY } = Constants.expoConfig.extra;

// const ipcData = [
//   { code: "IPC 498A", description: "Husband or relatives subjecting a woman to cruelty" },
//   { code: "IPC 323", description: "Punishment for voluntarily causing hurt" },
//   { code: "IPC 354", description: "Assault or criminal force on woman with intent to outrage modesty" },
//   { code: "PWDVA Sec 18", description: "Protection orders for the victim" },
//   { code: "PWDVA Sec 20", description: "Monetary reliefs for the victim" }
// ];

// const SYSTEM_PROMPT = `
// You are a Legal Assistant specialized in Indian law.
// Only answer using IPC/PWDVA JSON, chat history, and reliable Indian legal sites (e.g., indiacode.nic.in).
// Do not give personal opinions or unrelated answers.
// `;

// const LegalAssistant = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const navigation = useNavigation();

//   // Load chat history from AsyncStorage
//   useEffect(() => {
//     (async () => {
//       const stored = await AsyncStorage.getItem("chatHistory");
//       if (stored) setMessages(JSON.parse(stored));
//     })();
//   }, []);

//   const saveHistory = async (newMessages) => {
//     setMessages(newMessages);

//     // Save to Supabase
//     await supabase.from("chat_history").insert(
//       newMessages.map(msg => ({
//         role: msg.role,
//         content: msg.content,
//         created_at: new Date()
//       }))
//     );

//     // Save to AsyncStorage fallback
//     await AsyncStorage.setItem("chatHistory", JSON.stringify(newMessages));
//   };

//   const searchIPC = (query) => {
//     return ipcData.find(law =>
//       query.toLowerCase().includes(law.code.toLowerCase().split(" ")[1])
//     );
//   };

//   const webSearch = async (query) => {
//     try {
//       const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query + " site:indiacode.nic.in")}&format=json`);
//       const data = await res.json();
//       return data.RelatedTopics?.[0]?.Text || "";
//     } catch {
//       return "";
//     }
//   };

//   const callGemini = async (query, history, webSnippet) => {
//     try {
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
//               ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
//               { role: "user", parts: [{ text: query + "\n\nWeb context: " + webSnippet }] }
//             ]
//           }),
//         }
//       );
//       const data = await res.json();
//       return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not find relevant IPC/PWDVA sections.";
//     } catch (err) {
//       console.error("Gemini error:", err);
//       return "Error reaching legal knowledge sources.";
//     }
//   };

//   const sendMessage = async () => {
//     if (!input) return;

//     const newMessages = [...messages, { role: "user", content: input }];
//     let assistantReply = "Let me check IPC & PWDVA sections for you...";

//     const match = searchIPC(input);
//     if (match) {
//       assistantReply = `${match.code}: ${match.description}`;
//     } else {
//       const webSnippet = await webSearch(input);
//       assistantReply = await callGemini(input, newMessages, webSnippet);
//     }

//     const updatedMessages = [...newMessages, { role: "assistant", content: assistantReply }];
//     setInput("");
//     await saveHistory(updatedMessages);
//   };

//   return (
//     <LinearGradient colors={[theme.primary, theme.secondary]} style={localStyles.container}>
//       <BackButton onPress={() => navigation.goBack()} />
//       <Text style={localStyles.title}>Legal Assistant</Text>

//       <FlatList
//         data={messages}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View style={{ marginVertical: 6, alignSelf: item.role === "user" ? "flex-end" : "flex-start" }}>
//             <Text style={{ color: item.role === "user" ? theme.blue : theme.text }}>
//               {item.role === "user" ? "You: " : "Assistant: "} {item.content}
//             </Text>
//           </View>
//         )}
//       />

//       <View style={localStyles.inputRow}>
//         <BlurView intensity={90} style={localStyles.inputContainer}>
//           <TextInput
//             style={localStyles.textInput}
//             placeholder="Ask about IPC/PWDVA..."
//             value={input}
//             onChangeText={setInput}
//           />
//           <TouchableOpacity style={localStyles.sendButton} onPress={sendMessage}>
//             <MessageCircle size={24} color="#fff" />
//           </TouchableOpacity>
//         </BlurView>
//       </View>
//     </LinearGradient>
//   );
// };

// const localStyles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 70, alignItems: 'center' },
//   title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 16 },
//   inputRow: { width: '100%', paddingHorizontal: 16, marginBottom: 24 },
//   inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
//   textInput: { flex: 1, height: 44, fontSize: 16, color: '#000' },
//   sendButton: { padding: 8, backgroundColor: theme.blue, borderRadius: 12, marginLeft: 8 }
// });

// export default LegalAssistant;


// import React, { useState, useEffect } from "react";
// import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
// import Constants from 'expo-constants';
// import * as FileSystem from 'expo-file-system';
// import { theme } from '../../constants/colors';
// import { MessageCircle } from 'lucide-react-native';
// import { BlurView } from 'expo-blur';
// import { LinearGradient } from 'expo-linear-gradient';
// import BackButton from '../../components/UI/BackButton';
// import { supabase } from '../../services/supabaseClient';
// import { useNavigation } from '@react-navigation/native';

// const { GEMINI_API_KEY } = Constants.expoConfig.extra;

// // Unified IPC + PWDVA JSON array
// const legalSections = [
//    {
//     "section": "498A",
//     "title": "Cruelty by husband or relatives",
//     "description": "Covers physical and mental cruelty, harassment, including dowry-related abuse."
//   },
//   {
//     "section": "304B",
//     "title": "Dowry death",
//     "description": "Death of a woman caused by cruelty or harassment over dowry within 7 years of marriage."
//   },
//   {
//     "section": "351",
//     "title": "Assault",
//     "description": "Any gesture or preparation causing apprehension of bodily harm."
//   },
//   {
//     "section": "352",
//     "title": "Punishment for assault or criminal force otherwise than on grave provocation",
//     "description": "Covers use of force or assault without grave provocation."
//   },
//   {
//     "section": "350",
//     "title": "Criminal force",
//     "description": "Using force without consent to cause harm, fear or annoyance."
//   },
//   {
//     "section": "355",
//     "title": "Assault or criminal force with intent to dishonour",
//     "description": "Covers acts of physical humiliation or dishonour."
//   },
//   {
//     "section": "362",
//     "title": "Abduction",
//     "description": "Taking away a person without consent by force or deceit."
//   },
//   {
//     "section": "368",
//     "title": "Wrongfully concealing or confining abducted person",
//     "description": "Knowingly concealing or keeping confined an abducted person."
//   },
//   {
//     "section": "503",
//     "title": "Criminal intimidation",
//     "description": "Threats to cause injury to person, reputation or property."
//   },
//   {
//     "section": "504",
//     "title": "Intentional insult with intent to provoke breach of peace",
//     "description": "Verbal abuse or insult intended to provoke disturbance."
//   },
//   {
//     "section": "506",
//     "title": "Punishment for criminal intimidation",
//     "description": "Covers threats of death, grievous hurt, or serious harm."
//   },
//   {
//     "section": "507",
//     "title": "Criminal intimidation by anonymous communication",
//     "description": "Threats sent without revealing identity (letters, messages)."
//   },
//   {
//     "section": "509",
//     "title": "Word, gesture or act intended to insult modesty of a woman",
//     "description": "Covers verbal/non-verbal acts intended to insult a woman's dignity."
//   },
//   {
//     "section": "294",
//     "title": "Obscene acts and songs",
//     "description": "Obscene words or acts causing annoyance in public."
//   },
//   {
//     "section": "376",
//     "title": "Rape",
//     "description": "Non-consensual sexual intercourse."
//   },
//   {
//     "section": "354",
//     "title": "Assault or criminal force to woman with intent to outrage modesty",
//     "description": "Covers acts intended to outrage modesty of a woman."
//   },
//   {
//     "section": "354A",
//     "title": "Sexual harassment",
//     "description": "Includes unwelcome contact, demands, or sexually coloured remarks."
//   },
//   {
//     "section": "354B",
//     "title": "Assault with intent to disrobe",
//     "description": "Forceful attempt to disrobe a woman."
//   },
//   {
//     "section": "354C",
//     "title": "Voyeurism",
//     "description": "Capturing or watching a woman in private without consent."
//   },
//   {
//     "section": "354D",
//     "title": "Stalking",
//     "description": "Repeated following or contacting a person against their will."
//   },
//   {
//     "section": "306",
//     "title": "Abetment of suicide",
//     "description": "When cruelty or harassment leads to suicide."
//   },
//   {
//     "section": "323",
//     "title": "Voluntarily causing hurt",
//     "description": "Causing bodily pain or injury without grave provocation."
//   },
//   {
//     "section": "324",
//     "title": "Voluntarily causing hurt by dangerous weapons",
//     "description": "Causing injury using dangerous objects or means."
//   },
//   {
//     "section": "326",
//     "title": "Voluntarily causing grievous hurt by dangerous weapons",
//     "description": "Serious injuries caused by dangerous weapons or means."
//   },
//   {
//     "section": "307",
//     "title": "Attempt to murder",
//     "description": "Violence with intent to kill, though death may not occur."
//   },
//   {
//     "section": "299",
//     "title": "Culpable homicide",
//     "description": "Causing death with knowledge but without intent to murder."
//   },
//   {
//     "section": "300",
//     "title": "Murder",
//     "description": "Intentionally causing death."
//   },
//   {
//     "section": "301",
//     "title": "Culpable homicide by causing death of person other than intended",
//     "description": "Death caused to unintended person during violent act."
//   },
//   {
//     "section": "302",
//     "title": "Punishment for murder",
//     "description": "Prescribes penalty for murder."
//   },
//   {
//     "section": "304",
//     "title": "Punishment for culpable homicide not amounting to murder",
//     "description": "Covers cases where intent to murder is absent."
//   },
//   {
//     "section": "311",
//     "title": "Attempt to commit offences punishable with death or life imprisonment",
//     "description": "Covers attempts to commit serious crimes."
//   },
//   {
//     "section": "2(a)",
//     "title": "Aggrieved Person",
//     "description": "Defines an aggrieved person as any woman who is, or has been, in a domestic relationship and has been subjected to domestic violence."
//   },
//   {
//     "section": "2(f)",
//     "title": "Domestic Relationship",
//     "description": "Defines domestic relationship as a relationship between two persons who live, or have lived, together in a shared household."
//   },
//   {
//     "section": "2(q)",
//     "title": "Respondent",
//     "description": "Defines respondent as any adult male who is, or has been, in a domestic relationship with the aggrieved person, and relatives of the husband or male partner."
//   },
//   {
//     "section": "3",
//     "title": "Definition of Domestic Violence",
//     "description": "Covers physical abuse, sexual abuse, verbal and emotional abuse, and economic abuse."
//   },
//   {
//     "section": "4",
//     "title": "Information to Protection Officer and Others",
//     "description": "Any person who has reason to believe that an act of domestic violence has been committed may give information to the Protection Officer."
//   },
//   {
//     "section": "5",
//     "title": "Duties of Police Officers, Service Providers and Magistrates",
//     "description": "Ensures they inform the aggrieved woman of her rights under the Act."
//   },
//   {
//     "section": "6",
//     "title": "Duty to Inform the Aggrieved Person",
//     "description": "Protection Officer must inform the woman about her rights to protection orders, legal aid, shelter homes and medical facilities."
//   },
//   {
//     "section": "7",
//     "title": "Counselors",
//     "description": "Magistrate may seek assistance of counselors for settlement and protection."
//   },
//   {
//     "section": "8",
//     "title": "Protection Officers",
//     "description": "Appointment of Protection Officers by the State Government to assist the aggrieved person."
//   },
//   {
//     "section": "9",
//     "title": "Duties of Protection Officers",
//     "description": "Protection Officers must assist victims in filing applications, provide information, ensure compliance with orders."
//   },
//   {
//     "section": "10",
//     "title": "Service Providers",
//     "description": "Recognized NGOs and institutions may provide shelter, medical aid, legal aid and counseling to aggrieved persons."
//   },
//   {
//     "section": "12",
//     "title": "Application to Magistrate",
//     "description": "Aggrieved person or Protection Officer can file an application before the Magistrate seeking relief."
//   },
//   {
//     "section": "13",
//     "title": "Service of Notice",
//     "description": "Magistrate directs service of notice to the respondent."
//   },
//   {
//     "section": "14",
//     "title": "Counseling",
//     "description": "Magistrate may direct respondent or aggrieved person to undergo counseling."
//   },
//   {
//     "section": "15",
//     "title": "Assistance of Welfare Expert",
//     "description": "Magistrate may appoint a welfare expert to assist in proceedings."
//   },
//   {
//     "section": "17",
//     "title": "Right to Reside in a Shared Household",
//     "description": "Aggrieved woman has the right to reside in the shared household, regardless of ownership."
//   },
//   {
//     "section": "18",
//     "title": "Protection Orders",
//     "description": "Magistrate may prohibit respondent from committing violence, contacting the aggrieved person, or entering the workplace."
//   },
//   {
//     "section": "19",
//     "title": "Residence Orders",
//     "description": "Magistrate may order respondent to remove himself from the shared household or restrain him from dispossessing the woman."
//   },
//   {
//     "section": "20",
//     "title": "Monetary Relief",
//     "description": "Magistrate may direct respondent to provide monetary relief to meet expenses incurred by the aggrieved woman."
//   },
//   {
//     "section": "21",
//     "title": "Custody Orders",
//     "description": "Magistrate may grant temporary custody of children to the aggrieved woman."
//   },
//   {
//     "section": "22",
//     "title": "Compensation Orders",
//     "description": "Magistrate may direct respondent to pay compensation and damages for injuries, including mental torture and emotional distress."
//   },
//   {
//     "section": "23",
//     "title": "Power to Grant Interim and Ex Parte Orders",
//     "description": "Magistrate may grant interim and ex parte orders based on the application."
//   },
//   {
//     "section": "25",
//     "title": "Duration and Alteration of Orders",
//     "description": "Orders remain in force until modified or revoked by the Magistrate."
//   },
//   {
//     "section": "28",
//     "title": "Procedure",
//     "description": "All proceedings under Sections 12, 18–23 and 31 are governed by the CrPC."
//   },
//   {
//     "section": "31",
//     "title": "Penalty for Breach of Protection Order",
//     "description": "Breach of a protection order is punishable with imprisonment up to one year and/or fine up to Rs. 20,000."
//   },
//   {
//     "section": "32",
//     "title": "Cognizance and Proof",
//     "description": "Offences under Section 31 are cognizable and non-bailable."
//   },
//   {
//     "section": "36",
//     "title": "Act Not in Derogation of Other Laws",
//     "description": "The provisions of this Act are in addition to, not in derogation of, existing laws."
//   }
// ];

// const SYSTEM_PROMPT = `
// You are a Legal Assistant specialized in Indian law.
// Only answer using IPC/PWDVA JSON, chat history, and reliable Indian legal sites (e.g., indiacode.nic.in).
// Do not give personal opinions or unrelated answers.
// `;

// const LegalAssistant = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const navigation = useNavigation();

//   const chatFolder = FileSystem.documentDirectory + "JSON/";
//   const chatFile = chatFolder + "chatHistory.json";

//   // Load chat history from local JSON folder or Supabase fallback
//   useEffect(() => {
//     (async () => {
//       try {
//         const folderInfo = await FileSystem.getInfoAsync(chatFolder);
//         if (!folderInfo.exists) await FileSystem.makeDirectoryAsync(chatFolder, { intermediates: true });

//         const fileInfo = await FileSystem.getInfoAsync(chatFile);
//         if (fileInfo.exists) {
//           const data = await FileSystem.readAsStringAsync(chatFile);
//           setMessages(JSON.parse(data));
//         }
//       } catch (err) {
//         console.error("Error loading chat history:", err);
//       }
//     })();
//   }, []);

//   const saveHistory = async (newMessages) => {
//     setMessages(newMessages);

//     // Save to Supabase
//     await supabase.from("chat_history").insert(
//       newMessages.map(msg => ({
//         role: msg.role,
//         content: msg.content,
//         created_at: new Date()
//       }))
//     );

//     // Save to local JSON as fallback
//     try {
//       await FileSystem.writeAsStringAsync(chatFile, JSON.stringify(newMessages));
//     } catch (err) {
//       console.error("Error saving chat JSON:", err);
//     }
//   };

//   // Search IPC/PWDVA JSON array
//   const searchLegalSections = (query) => {
//     return legalSections.find(sec =>
//       query.toLowerCase().includes(sec.section.toLowerCase())
//     );
//   };

//   const webSearch = async (query) => {
//     try {
//       const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query + " site:indiacode.nic.in")}&format=json`);
//       const data = await res.json();
//       return data.RelatedTopics?.[0]?.Text || "";
//     } catch {
//       return "";
//     }
//   };

//   const callGemini = async (query, history, webSnippet) => {
//     try {
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
//               ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
//               { role: "user", parts: [{ text: query + "\n\nWeb context: " + webSnippet }] }
//             ]
//           }),
//         }
//       );
//       const data = await res.json();
//       return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not find relevant legal sections.";
//     } catch (err) {
//       console.error("Gemini error:", err);
//       return "Error reaching legal knowledge sources.";
//     }
//   };

//   const sendMessage = async () => {
//     if (!input) return;

//     const newMessages = [...messages, { role: "user", content: input }];
//     let assistantReply = "Checking IPC & PWDVA sections...";

//     const match = searchLegalSections(input);
//     if (match) {
//       assistantReply = `${match.section}: ${match.title}\n${match.description}`;
//     } else {
//       const webSnippet = await webSearch(input);
//       assistantReply = await callGemini(input, newMessages, webSnippet);
//     }

//     const updatedMessages = [...newMessages, { role: "assistant", content: assistantReply }];
//     setInput("");
//     await saveHistory(updatedMessages);
//   };

//   return (
//     <LinearGradient colors={[theme.primary, theme.secondary]} style={localStyles.container}>
//       <BackButton onPress={() => navigation.goBack()} />
//       <Text style={localStyles.title}>Legal Assistant</Text>

//       <FlatList
//         data={messages}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View style={{ marginVertical: 6, alignSelf: item.role === "user" ? "flex-end" : "flex-start" }}>
//             <Text style={{ color: item.role === "user" ? theme.blue : theme.text }}>
//               {item.role === "user" ? "You: " : "Assistant: "} {item.content}
//             </Text>
//           </View>
//         )}
//       />

//       <View style={localStyles.inputRow}>
//         <BlurView intensity={90} style={localStyles.inputContainer}>
//           <TextInput
//             style={localStyles.textInput}
//             placeholder="Ask about IPC/PWDVA..."
//             value={input}
//             onChangeText={setInput}
//           />
//           <TouchableOpacity style={localStyles.sendButton} onPress={sendMessage}>
//             <MessageCircle size={24} color="#fff" />
//           </TouchableOpacity>
//         </BlurView>
//       </View>
//     </LinearGradient>
//   );
// };

// const localStyles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 70, alignItems: 'center' },
//   title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 16 },
//   inputRow: { width: '100%', paddingHorizontal: 16, marginBottom: 24 },
//   inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
//   textInput: { flex: 1, height: 44, fontSize: 16, color: '#000' },
//   sendButton: { padding: 8, backgroundColor: theme.blue, borderRadius: 12, marginLeft: 8 }
// });

// export default LegalAssistant;



// import React, { useState, useEffect } from "react";
// import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView } from "react-native";
// import Constants from 'expo-constants';
// import * as FileSystem from 'expo-file-system';
// import { theme } from '../../constants/colors';
// import { MessageCircle } from 'lucide-react-native';
// import { BlurView } from 'expo-blur';
// import { LinearGradient } from 'expo-linear-gradient';
// import BackButton from '../../components/UI/BackButton';
// import { supabase } from '../../services/supabaseClient';
// import { useNavigation } from '@react-navigation/native';

// const { GEMINI_API_KEY } = Constants.expoConfig.extra;

// // Unified IPC + PWDVA JSON array (example, replace with full dataset)
// const legalSections = [
//   {
//     section: "498A",
//     title: "Cruelty by husband or relatives",
//     description: "Covers physical and mental cruelty, harassment, including dowry-related abuse."
//   },
//   {
//     section: "304B",
//     title: "Dowry death",
//     description: "Death of a woman caused by cruelty or harassment over dowry within 7 years of marriage."
//   },
//   {
//     section: "351",
//     title: "Assault",
//     description: "Any gesture or preparation causing apprehension of bodily harm."
//   },
//   {
//     section: "352",
//     title: "Punishment for assault or criminal force otherwise than on grave provocation",
//     description: "Covers use of force or assault without grave provocation."
//   }
// ];

// const SYSTEM_PROMPT = `
// You are a Legal Assistant specialized in Indian law. 
// You must provide empathetic, calming, and supportive responses to users who may describe traumatic incidents. 
// - Always acknowledge the user's feelings and provide reassurance. 
// - Give relevant IPC/PWDVA sections from the JSON provided. 
// - Explain the victim's legal rights clearly. 
// - Provide step-by-step guidance on taking legal action, including reporting, documentation, and approaching authorities. 
// - Never give personal opinions or unrelated advice. 
// Respond in a clear, compassionate, and professional tone.
// `;

// const LegalAssistant = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const navigation = useNavigation();

//   const chatFolder = FileSystem.documentDirectory + "JSON/";
//   const chatFile = chatFolder + "chatHistory.json";

//   // Load chat history
//   useEffect(() => {
//     (async () => {
//       try {
//         const folderInfo = await FileSystem.getInfoAsync(chatFolder);
//         if (!folderInfo.exists) await FileSystem.makeDirectoryAsync(chatFolder, { intermediates: true });

//         const fileInfo = await FileSystem.getInfoAsync(chatFile);
//         if (fileInfo.exists) {
//           const data = await FileSystem.readAsStringAsync(chatFile);
//           setMessages(JSON.parse(data));
//         }
//       } catch (err) {
//         console.error("Error loading chat history:", err);
//       }
//     })();
//   }, []);

//   // Save messages to Supabase + JSON
//   const saveHistory = async (newMessages) => {
//     setMessages(newMessages);

//     try {
//       const { data: { user }, error: userError } = await supabase.auth.getUser();
//       if (userError) throw userError;

//       const { error } = await supabase
//         .from("chat_history")
//         .insert(
//           newMessages.map(msg => ({
//             user_id: user.id,
//             role: msg.role,
//             content: msg.content,
//             created_at: new Date()
//           }))
//         );

//       if (error) console.error("Supabase insert error:", error.message);
//     } catch (err) {
//       console.error("Supabase request failed:", err);
//     }

//     try {
//       await FileSystem.writeAsStringAsync(chatFile, JSON.stringify(newMessages), {
//         encoding: FileSystem.EncodingType.UTF8,
//       });
//     } catch (err) {
//       console.error("Failed to save chat JSON:", err);
//     }
//   };

//   // Search IPC/PWDVA JSON
//   const searchLegalSections = (query) => {
//     return legalSections.filter(sec =>
//       query.toLowerCase().includes(sec.section.toLowerCase())
//     );
//   };

//   // Optional web search (for extra context)
//   const webSearch = async (query) => {
//     try {
//       const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query + " site:indiacode.nic.in")}&format=json`);
//       const data = await res.json();
//       return data.RelatedTopics?.[0]?.Text || "";
//     } catch {
//       return "";
//     }
//   };

//   // Gemini API call
//   const callGemini = async (query, history, webSnippet) => {
//     try {
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
//               ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
//               { role: "user", parts: [{ text: query + "\n\nWeb context: " + webSnippet }] }
//             ]
//           }),
//         }
//       );
//       const data = await res.json();
//       return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not find relevant legal sections.";
//     } catch (err) {
//       console.error("Gemini error:", err);
//       return "Error reaching legal knowledge sources.";
//     }
//   };

//   const sendMessage = async () => {
//     if (!input) return;

//     const newMessages = [...messages, { role: "user", content: input }];
//     let assistantReply = "Let me provide guidance based on your incident...";

//     const matches = searchLegalSections(input);
//     if (matches.length > 0) {
//       assistantReply = matches.map(m => `${m.section}: ${m.title}\n${m.description}`).join("\n\n");
//     } else {
//       const webSnippet = await webSearch(input);
//       assistantReply = await callGemini(input, newMessages, webSnippet);
//     }

//     const updatedMessages = [...newMessages, { role: "assistant", content: assistantReply }];
//     setInput("");
//     await saveHistory(updatedMessages);
//   };

//   return (
//     <LinearGradient colors={[theme.primary, theme.secondary]} style={localStyles.container}>
//       <BackButton onPress={() => navigation.goBack()} />
//       <Text style={localStyles.title}>Legal Assistant</Text>

//       <FlatList
//         data={messages}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View style={{ marginVertical: 6, alignSelf: item.role === "user" ? "flex-end" : "flex-start" }}>
//             <Text style={{ color: item.role === "user" ? theme.blue : theme.text }}>
//               {item.role === "user" ? "You: " : "Assistant: "} {item.content}
//             </Text>
//           </View>
//         )}
//       />

//       <View style={localStyles.inputRow}>
//         <BlurView intensity={90} style={localStyles.inputContainer}>
//           <TextInput
//             style={localStyles.textInput}
//             placeholder="Describe your incident..."
//             value={input}
//             onChangeText={setInput}
//             multiline
//           />
//           <TouchableOpacity style={localStyles.sendButton} onPress={sendMessage}>
//             <MessageCircle size={24} color="#fff" />
//           </TouchableOpacity>
//         </BlurView>
//       </View>
//     </LinearGradient>
//   );
// };

// const localStyles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 70, alignItems: 'center' },
//   title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 16 },
//   inputRow: { width: '100%', paddingHorizontal: 16, marginBottom: 24 },
//   inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
//   textInput: { flex: 1, minHeight: 44, fontSize: 16, color: '#000' },
//   sendButton: { padding: 8, backgroundColor: theme.blue, borderRadius: 12, marginLeft: 8 }
// });

// export default LegalAssistant;




// import React, { useState, useEffect } from "react";
// import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
// import Constants from 'expo-constants';
// import * as FileSystem from 'expo-file-system';
// import { theme } from '../../constants/colors';
// import { MessageCircle } from 'lucide-react-native';
// import { BlurView } from 'expo-blur';
// import { LinearGradient } from 'expo-linear-gradient';
// import BackButton from '../../components/UI/BackButton';
// import { supabase } from '../../services/supabaseClient';
// import { useNavigation } from '@react-navigation/native';

// const { GEMINI_API_KEY } = Constants.expoConfig.extra;

// // Unified IPC + PWDVA JSON array
// const legalSections = [
//   { section: "498A", title: "Cruelty by husband or relatives", description: "Covers physical and mental cruelty, harassment, including dowry-related abuse." },
//   { section: "304B", title: "Dowry death", description: "Death of a woman caused by cruelty or harassment over dowry within 7 years of marriage." },
//   { section: "351", title: "Assault", description: "Any gesture or preparation causing apprehension of bodily harm." },
//   { section: "352", title: "Punishment for assault or criminal force otherwise than on grave provocation", description: "Covers use of force or assault without grave provocation." }
// ];

// const SYSTEM_PROMPT = `
// You are a Legal Assistant specialized in Indian law. 
// - Provide empathetic, calming, and supportive responses.
// - Acknowledge feelings and reassure the user.
// - Give relevant IPC/PWDVA sections from the JSON.
// - Explain victim's legal rights clearly.
// - Provide step-by-step guidance for reporting, documentation, and approaching authorities.
// - Respond professionally and compassionately.
// `;

// const chatFolder = FileSystem.documentDirectory + "JSON/";
// const chatFile = chatFolder + "chat_history.json";

// const LegalAssistant = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const navigation = useNavigation();

//   // Load chat history from Supabase on start
//   useEffect(() => {
//     const loadHistory = async () => {
//       try {
//         // Ensure local folder exists
//         const folderInfo = await FileSystem.getInfoAsync(chatFolder);
//         if (!folderInfo.exists) await FileSystem.makeDirectoryAsync(chatFolder, { intermediates: true });

//         // Load local JSON file if exists
//         const fileInfo = await FileSystem.getInfoAsync(chatFile);
//         if (fileInfo.exists) {
//           const data = await FileSystem.readAsStringAsync(chatFile);
//           setMessages(JSON.parse(data));
//         }

//         // Load Supabase history
//         const { data, error } = await supabase
//           .from("chat_history")
//           .select("*")
//           .order("created_at", { ascending: true });

//         if (error) console.error("Supabase fetch error:", error);
//         else if (data) {
//           const supabaseMessages = data.map(msg => ({ role: msg.role, content: msg.content }));
//           // Merge with local messages, avoiding duplicates
//           const merged = [...messages, ...supabaseMessages.filter(m => !messages.some(l => l.content === m.content && l.role === m.role))];
//           setMessages(merged);

//           // Save merged to JSON
//           await FileSystem.writeAsStringAsync(chatFile, JSON.stringify(merged), {
//             encoding: FileSystem.EncodingType.UTF8,
//           });
//         }

//       } catch (err) {
//         console.error("Error loading chat history:", err);
//       }
//     };

//     loadHistory();
//   }, []);

//   // Save only the latest message to Supabase and append to local JSON
//   const saveMessage = async (message) => {
//     setMessages(prev => [...prev, message]);

//     try {
//       await supabase
//         .from("chat_history")
//         .insert([{ role: message.role, content: message.content, created_at: new Date() }]);
//     } catch (err) {
//       console.error("Supabase insert error:", err);
//     }

//     try {
//       const fileInfo = await FileSystem.getInfoAsync(chatFile);
//       let currentData = [];
//       if (fileInfo.exists) {
//         const data = await FileSystem.readAsStringAsync(chatFile);
//         currentData = JSON.parse(data);
//       }
//       currentData.push(message);
//       await FileSystem.writeAsStringAsync(chatFile, JSON.stringify(currentData), {
//         encoding: FileSystem.EncodingType.UTF8,
//       });
//     } catch (err) {
//       console.error("Failed to save chat JSON:", err);
//     }
//   };

//   const searchLegalSections = (query) => {
//     return legalSections.filter(sec => query.toLowerCase().includes(sec.section.toLowerCase()));
//   };

//   const webSearch = async (query) => {
//     try {
//       const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query + " site:indiacode.nic.in")}&format=json`);
//       const data = await res.json();
//       return data.RelatedTopics?.[0]?.Text || "";
//     } catch {
//       return "";
//     }
//   };

//   const callGemini = async (query, history, webSnippet) => {
//     try {
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
//               ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
//               { role: "user", parts: [{ text: query + "\n\nWeb context: " + webSnippet }] }
//             ]
//           }),
//         }
//       );
//       const data = await res.json();
//       return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not find relevant legal sections.";
//     } catch (err) {
//       console.error("Gemini error:", err);
//       return "Error reaching legal knowledge sources.";
//     }
//   };

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMessage = { role: "user", content: input };
//     await saveMessage(userMessage);

//     let assistantReply = "Let me provide guidance based on your incident...";
//     const matches = searchLegalSections(input);

//     if (matches.length > 0) {
//       assistantReply = matches.map(m => `${m.section}: ${m.title}\n${m.description}`).join("\n\n");
//     } else {
//       const webSnippet = await webSearch(input);
//       assistantReply = await callGemini(input, [...messages, userMessage], webSnippet);
//     }

//     const assistantMessage = { role: "assistant", content: assistantReply };
//     await saveMessage(assistantMessage);
//     setInput("");
//   };

//   return (
//     <LinearGradient colors={[theme.primary, theme.secondary]} style={localStyles.container}>
//       <BackButton onPress={() => navigation.goBack()} />
//       <Text style={localStyles.title}>Legal Assistant</Text>

//       <FlatList
//         data={messages}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View style={{ marginVertical: 6, alignSelf: item.role === "user" ? "flex-end" : "flex-start" }}>
//             <Text style={{ color: item.role === "user" ? theme.blue : theme.text }}>
//               {item.role === "user" ? "You: " : "Assistant: "} {item.content}
//             </Text>
//           </View>
//         )}
//       />

//       <View style={localStyles.inputRow}>
//         <BlurView intensity={90} style={localStyles.inputContainer}>
//           <TextInput
//             style={localStyles.textInput}
//             placeholder="Describe your incident..."
//             value={input}
//             onChangeText={setInput}
//             multiline
//           />
//           <TouchableOpacity style={localStyles.sendButton} onPress={sendMessage}>
//             <MessageCircle size={24} color="#fff" />
//           </TouchableOpacity>
//         </BlurView>
//       </View>
//     </LinearGradient>
//   );
// };

// const localStyles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 70, alignItems: 'center' },
//   title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 16 },
//   inputRow: { width: '100%', paddingHorizontal: 16, marginBottom: 24 },
//   inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
//   textInput: { flex: 1, minHeight: 44, fontSize: 16, color: '#000' },
//   sendButton: { padding: 8, backgroundColor: theme.blue, borderRadius: 12, marginLeft: 8 }
// });

// export default LegalAssistant;


// import React, { useState, useEffect } from "react";
// import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
// import Constants from "expo-constants";
// import * as FileSystem from "expo-file-system";
// import { theme } from "../../constants/colors";
// import { MessageCircle } from "lucide-react-native";
// import { BlurView } from "expo-blur";
// import { LinearGradient } from "expo-linear-gradient";
// import BackButton from "../../components/UI/BackButton";
// import { supabase } from "../../services/supabaseClient";
// import { useNavigation } from "@react-navigation/native";

// const { GEMINI_API_KEY } = Constants.expoConfig.extra;

// // Complete IPC + PWDVA JSON (add full dataset here)
// const legalSections = [
//   {
//     "section": "498A",
//     "title": "Cruelty by husband or relatives",
//     "description": "Covers physical and mental cruelty, harassment, including dowry-related abuse."
//   },
//   {
//     "section": "304B",
//     "title": "Dowry death",
//     "description": "Death of a woman caused by cruelty or harassment over dowry within 7 years of marriage."
//   },
//   {
//     "section": "351",
//     "title": "Assault",
//     "description": "Any gesture or preparation causing apprehension of bodily harm."
//   }
// ];

// // SYSTEM PROMPT: Very detailed legal assistant instructions
// const SYSTEM_PROMPT = `
// You are an AI Legal Assistant specialized in Indian law, particularly domestic violence and related criminal law. 
// Your role is to provide support, guidance, and clarity to victims of domestic abuse, harassment, assault, dowry-related crimes, and other legal incidents. 
// Always respond in a compassionate, professional, and clear manner. Never give personal opinions or blame the victim.

// 1. Treat all user input as serious and confidential.
// 2. Acknowledge emotions and reassure users.
// 3. Use plain language; assume the user has no legal knowledge.
// `;

// // File paths
// const chatFolder = FileSystem.documentDirectory + "JSON/";
// const chatFile = chatFolder + "chat_history.json";

// const LegalAssistant = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const navigation = useNavigation();

//   // Load chat history from Supabase but clear screen
//   useEffect(() => {
//     (async () => {
//       try {
//         const { data, error } = await supabase
//           .from("chat_history")
//           .select("*")
//           .order("created_at", { ascending: true });

//         if (error) console.error("Supabase fetch error:", error);
//         // Only use this to "learn" context, screen is cleared
//       } catch (err) {
//         console.error("Error loading Supabase history:", err);
//       }
//     })();
//     setMessages([]); // Clear screen on open
//   }, []);

//   // Save only the latest message to Supabase and full history to JSON
//   const saveMessage = async (msg) => {
//     setMessages((prev) => [...prev, msg]);

//     // Supabase insert: only the latest message
//     try {
//       const { error } = await supabase.from("chat_history").insert({
//         role: msg.role,
//         content: msg.content,
//         created_at: new Date(),
//       });
//       if (error) console.error("Supabase insert error:", error.message);
//     } catch (err) {
//       console.error("Supabase request failed:", err);
//     }

//     // Save full history to JSON
//     try {
//       const folderInfo = await FileSystem.getInfoAsync(chatFolder);
//       if (!folderInfo.exists) await FileSystem.makeDirectoryAsync(chatFolder, { intermediates: true });

//       const fileInfo = await FileSystem.getInfoAsync(chatFile);
//       let fullHistory = [];
//       if (fileInfo.exists) {
//         const data = await FileSystem.readAsStringAsync(chatFile);
//         fullHistory = JSON.parse(data);
//       }
//       fullHistory.push(msg);
//       await FileSystem.writeAsStringAsync(chatFile, JSON.stringify(fullHistory), { encoding: FileSystem.EncodingType.UTF8 });
//     } catch (err) {
//       console.error("Failed to save chat JSON:", err);
//     }
//   };

//   // Search IPC/PWDVA JSON for matches
//   const searchLegalSections = (query) => {
//     return legalSections.filter(sec => query.toLowerCase().includes(sec.section.toLowerCase()));
//   };

//   // Gemini API call
//   const callGemini = async (query, history) => {
//     try {
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
//               ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
//               { role: "user", parts: [{ text: query }] },
//             ],
//           }),
//         }
//       );
//       const data = await res.json();
//       const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
//       if (!reply || reply.trim() === "") {
//         return "I understand your incident. Based on Indian law, this may fall under IPC Section 351 or 352 (assault). Document the event and consider reporting to the police. I can guide you through the steps.";
//       }
//       return reply;
//     } catch (err) {
//       console.error("Gemini error:", err);
//       return "Error reaching legal knowledge sources. Please try again later.";
//     }
//   };

//   // Handle sending a message
//   // Send message
// const sendMessage = async () => {
//   if (!input.trim()) return;

//   const newMessages = [...messages, { role: "user", content: input }];
//   setInput("Let me provide guidance...");

//   // Run both JSON lookup + Gemini
//   const matches = searchLegalSections(input);
//   const webSnippet = await webSearch(input);
//   let geminiReply = await callGemini(input, newMessages, webSnippet);

//   // Append IPC/PWDVA matches (if any)
//   let ipcReply = "";
//   if (matches.length > 0) {
//     ipcReply = "\n\n📜 Relevant IPC/PWDVA sections:\n" +
//       matches.map(m => `• Section ${m.section}: ${m.title} — ${m.description}`).join("\n");
//   }

//   const assistantReply = `${geminiReply}${ipcReply}`;

//   const updatedMessages = [...newMessages, { role: "assistant", content: assistantReply }];
//   setInput("");
//   await saveHistory(updatedMessages);
// };


//   return (
//     <LinearGradient colors={[theme.primary, theme.secondary]} style={localStyles.container}>
//       <BackButton onPress={() => navigation.goBack()} />
//       <Text style={localStyles.title}>Legal Assistant</Text>

//       <FlatList
//         data={messages}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View style={{ marginVertical: 6, alignSelf: item.role === "user" ? "flex-end" : "flex-start" }}>
//             <Text style={{ color: item.role === "user" ? theme.blue : theme.text }}>
//               {item.role === "user" ? "You: " : "Assistant: "} {item.content}
//             </Text>
//           </View>
//         )}
//       />

//       <View style={localStyles.inputRow}>
//         <BlurView intensity={90} style={localStyles.inputContainer}>
//           <TextInput
//             style={localStyles.textInput}
//             placeholder="Describe your incident..."
//             value={input}
//             onChangeText={setInput}
//             multiline
//           />
//           <TouchableOpacity style={localStyles.sendButton} onPress={sendMessage}>
//             <MessageCircle size={24} color="#fff" />
//           </TouchableOpacity>
//         </BlurView>
//       </View>
//     </LinearGradient>
//   );
// };

// const localStyles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 70, alignItems: "center" },
//   title: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 16 },
//   inputRow: { width: "100%", paddingHorizontal: 16, marginBottom: 24 },
//   inputContainer: { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
//   textInput: { flex: 1, minHeight: 44, fontSize: 16, color: "#000" },
//   sendButton: { padding: 8, backgroundColor: theme.blue, borderRadius: 12, marginLeft: 8 },
// });

// export default LegalAssistant;



//Changes ui
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import Constants from "expo-constants";
// import { theme } from "../../constants/colors";
// import { MessageCircle } from "lucide-react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import BackButton from "../../components/UI/BackButton";
// import { supabase } from "../../services/supabaseClient";
// import { useNavigation } from "@react-navigation/native";

// const { GEMINI_API_KEY } = Constants.expoConfig.extra;

// // IPC/PWDVA dataset
// const legalSections = [
//   {
//     section: "498A",
//     title: "Cruelty by husband or relatives",
//     description:
//       "Covers physical and mental cruelty, harassment, including dowry-related abuse.",
//   },
//   {
//     section: "304B",
//     title: "Dowry death",
//     description:
//       "Death of a woman caused by cruelty or harassment over dowry within 7 years of marriage.",
//   },
//   {
//     section: "351",
//     title: "Assault",
//     description: "Any gesture or preparation causing apprehension of bodily harm.",
//   },
// ];

// // System Prompt (shortened here, but you can expand)
// const SYSTEM_PROMPT = `
// You are a compassionate AI Legal Assistant specialized in Indian law.
// Always listen empathetically, never judge, and provide clear step-by-step guidance.
// Map incidents to IPC/PWDVA laws where possible, and explain rights + next actions.
// Use simple, reassuring language.
// `;

// // Component
// const LegalAssistant = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const navigation = useNavigation();

//   // Clear screen but keep Supabase history for context
//   useEffect(() => {
//     setMessages([]); // Clear local screen messages
//   }, []);

//   // Save only the latest message to Supabase
//   const saveMessage = async (msg) => {
//     setMessages((prev) => [...prev, msg]);
//     try {
//       const { error } = await supabase.from("chat_history").insert({
//         role: msg.role,
//         content: msg.content,
//         created_at: new Date(),
//       });
//       if (error) console.error("Supabase insert error:", error.message);
//     } catch (err) {
//       console.error("Supabase request failed:", err);
//     }
//   };

//   // Search IPC/PWDVA JSON
//   const searchLegalSections = (query) => {
//     return legalSections.filter((sec) =>
//       query.toLowerCase().includes(sec.section.toLowerCase())
//     );
//   };

//   // Gemini API call
//   const callGemini = async (query, history) => {
//     try {
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
//               ...history.map((h) => ({
//                 role: h.role,
//                 parts: [{ text: h.content }],
//               })),
//               { role: "user", parts: [{ text: query }] },
//             ],
//           }),
//         }
//       );

//       const data = await res.json();

//       // Handle multiple response formats
//       let reply =
//         data?.candidates?.[0]?.content?.parts?.[0]?.text ||
//         data?.candidates?.[0]?.content?.parts
//           ?.map((p) => p.text)
//           .filter(Boolean)
//           .join("\n") ||
//         "";

//       if (!reply || reply.trim() === "") {
//         return "I understand your incident. It may fall under IPC Section 351 or 352 (assault). Please document it and report to the police. I can guide you further.";
//       }

//       return reply.trim();
//     } catch (err) {
//       console.error("Gemini error:", err);
//       return "Error reaching legal knowledge sources. Please try again later.";
//     }
//   };

//   // Handle send
//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { role: "user", content: input }];
//     setInput("");

//     // Run Gemini
//     let geminiReply = await callGemini(input, newMessages);

//     // Append IPC/PWDVA matches
//     const matches = searchLegalSections(input);
//     let ipcReply = "";
//     if (matches.length > 0) {
//       ipcReply =
//         "\n\n📜 Relevant IPC/PWDVA sections:\n" +
//         matches
//           .map(
//             (m) => `• Section ${m.section}: ${m.title} — ${m.description}`
//           )
//           .join("\n");
//     }

//     const assistantReply = `${geminiReply}${ipcReply}`;
//     const updatedMessages = [
//       ...newMessages,
//       { role: "assistant", content: assistantReply },
//     ];

//     await saveMessage({ role: "user", content: input });
//     await saveMessage({ role: "assistant", content: assistantReply });

//     setMessages(updatedMessages);
//   };

//   return (
//     <LinearGradient colors={["#000", "#9d6200", "#000"]} style={styles.container}>
//       <BackButton onPress={() => navigation.goBack()} />
//       <Text style={styles.title}>Legal Assistant</Text>

//       <FlatList
//         data={messages}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View
//             style={[
//               styles.messageBubble,
//               item.role === "user"
//                 ? styles.userBubble
//                 : styles.assistantBubble,
//             ]}
//           >
//             <Text
//               style={{
//                 color: item.role === "user" ? "#fff" : "#000",
//               }}
//             >
//               {item.role === "assistant" ? "• " : ""}
//               {item.content}
//             </Text>
//           </View>
//         )}
//       />

//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         keyboardVerticalOffset={80}
//       >
//         <View style={styles.inputRow}>
//           <TextInput
//             style={styles.textInput}
//             placeholder="Describe your incident..."
//             placeholderTextColor="#aaa"
//             value={input}
//             onChangeText={setInput}
//             multiline
//           />
//           <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//             <MessageCircle size={24} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 70, paddingHorizontal: 12 },
//   title: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#fff",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   messageBubble: {
//     marginVertical: 6,
//     padding: 12,
//     borderRadius: 12,
//     maxWidth: "80%",
//   },
//   userBubble: {
//     alignSelf: "flex-end",
//     backgroundColor: "#9d6200",
//   },
//   assistantBubble: {
//     alignSelf: "flex-start",
//     backgroundColor: "#fff",
//   },
//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 12,
//     backgroundColor: "#1a1a1a",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   textInput: {
//     flex: 1,
//     minHeight: 44,
//     maxHeight: 120,
//     fontSize: 16,
//     color: "#fff",
//   },
//   sendButton: {
//     marginLeft: 8,
//     backgroundColor: "#9d6200",
//     padding: 10,
//     borderRadius: 50,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default LegalAssistant;



//SERPAPI
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import Constants from "expo-constants";
// import { theme } from "../../constants/colors";
// import { MessageCircle } from "lucide-react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import BackButton from "../../components/UI/BackButton";
// import { supabase } from "../../services/supabaseClient";
// import { useNavigation } from "@react-navigation/native";

// // 🔑 API Keys
// const { GEMINI_API_KEY, SERPAPI_KEY } = Constants.expoConfig.extra;

// // 📚 IPC/PWDVA dataset (expand yours here)
// const legalSections = [
//   {
//     section: "498A",
//     title: "Cruelty by husband or relatives",
//     description:
//       "Covers physical and mental cruelty, harassment, including dowry-related abuse.",
//     keywords: ["cruelty", "dowry", "husband", "harass", "torture"],
//   },
//   {
//     section: "304B",
//     title: "Dowry death",
//     description:
//       "Death of a woman caused by cruelty or harassment over dowry within 7 years of marriage.",
//     keywords: ["dowry death", "burn", "killed", "murdered", "bride"],
//   },
//   {
//     section: "351",
//     title: "Assault",
//     description: "Any gesture or preparation causing apprehension of bodily harm.",
//     keywords: ["hit", "slap", "punch", "beat", "assault", "attack"],
//   },
// ];

// // 🟢 System Prompt
// const SYSTEM_PROMPT = `
// You are a compassionate AI Legal Assistant specialized in Indian law.
// Always listen empathetically, never judge, and provide clear step-by-step guidance.
// Map incidents to IPC/PWDVA laws where possible, and explain rights + next actions.
// Use simple, reassuring language.
// `;

// // 🔎 Web Search Fallback (SerpAPI)
// const searchWeb = async (query) => {
//   try {
//     const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
//       query + " Indian law domestic violence IPC site:.gov.in OR site:.nic.in"
//     )}&api_key=${SERPAPI_KEY}`;

//     const res = await fetch(url);
//     const data = await res.json();

//     if (data.organic_results && data.organic_results.length > 0) {
//       return data.organic_results
//         .slice(0, 3)
//         .map((r, i) => `🔗 ${i + 1}. ${r.title} — ${r.link}`)
//         .join("\n");
//     } else {
//       return "I couldn’t find any reliable online references at the moment.";
//     }
//   } catch (err) {
//     console.error("Web search error:", err);
//     return "Error fetching online legal references.";
//   }
// };

// // 🟠 Keyword-based Legal Section Search
// const searchLegalSections = (query) => {
//   query = query.toLowerCase();
//   return legalSections.filter(
//     (sec) =>
//       query.includes(sec.section.toLowerCase()) ||
//       sec.keywords.some((kw) => query.includes(kw.toLowerCase()))
//   );
// };

// const LegalAssistant = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const navigation = useNavigation();

//   useEffect(() => {
//     setMessages([]); // Clear local screen on mount
//   }, []);

//   // 💾 Save to Supabase
//   const saveMessage = async (msg) => {
//     setMessages((prev) => [...prev, msg]);
//     try {
//       const { error } = await supabase.from("chat_history").insert({
//         role: msg.role,
//         content: msg.content,
//         created_at: new Date(),
//       });
//       if (error) console.error("Supabase insert error:", error.message);
//     } catch (err) {
//       console.error("Supabase request failed:", err);
//     }
//   };

//   // 🤖 Gemini API Call
//   const callGemini = async (query, history) => {
//     try {
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
//               ...history.map((h) => ({
//                 role: h.role,
//                 parts: [{ text: h.content }],
//               })),
//               { role: "user", parts: [{ text: query }] },
//             ],
//           }),
//         }
//       );

//       const data = await res.json();

//       let reply =
//         data?.candidates?.[0]?.content?.parts?.[0]?.text ||
//         data?.candidates?.[0]?.content?.parts
//           ?.map((p) => p.text)
//           .filter(Boolean)
//           .join("\n") ||
//         "";

//       if (!reply || reply.trim() === "") {
//         return "I understand your incident. It may fall under IPC Section 351 (assault). Please document it and report to the police.";
//       }

//       return reply.trim();
//     } catch (err) {
//       console.error("Gemini error:", err);
//       return "Error reaching legal knowledge sources. Please try again later.";
//     }
//   };

//   // 📩 Handle Send
//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { role: "user", content: input }];
//     setInput("");

//     // Step 1: Get empathetic response from Gemini
//     let geminiReply = await callGemini(input, newMessages);

//     // Step 2: Try to map to IPC/PWDVA dataset
//     const matches = searchLegalSections(input);
//     let ipcReply = "";

//     if (matches.length > 0) {
//       ipcReply =
//         "\n\n📜 Relevant IPC/PWDVA Sections:\n" +
//         matches
//           .map(
//             (m) =>
//               `• Section ${m.section}: ${m.title}\n   ${m.description}\n`
//           )
//           .join("\n") +
//         "\n👉 You can report this at your nearest police station or seek protection orders under PWDVA.";
//     } else {
//       // Step 3: Fallback → Web Search
//       const webResults = await searchWeb(input);
//       ipcReply = `\n\n🌐 I couldn’t find a direct IPC/PWDVA match in the dataset.  
// Here are some reliable references I found:\n${webResults}`;
//     }

//     // Step 4: Final Assistant Reply
//     const assistantReply = `${geminiReply}${ipcReply}`;
//     const updatedMessages = [
//       ...newMessages,
//       { role: "assistant", content: assistantReply },
//     ];

//     await saveMessage({ role: "user", content: input });
//     await saveMessage({ role: "assistant", content: assistantReply });

//     setMessages(updatedMessages);
//   };

//   return (
//     <LinearGradient colors={["#000", "#9d6200", "#000"]} style={styles.container}>
//       <BackButton onPress={() => navigation.goBack()} />
//       <Text style={styles.title}>Legal Assistant</Text>

//       <FlatList
//         data={messages}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View
//             style={[
//               styles.messageBubble,
//               item.role === "user"
//                 ? styles.userBubble
//                 : styles.assistantBubble,
//             ]}
//           >
//             <Text
//               style={{
//                 color: item.role === "user" ? "#fff" : "#000",
//               }}
//             >
//               {item.role === "assistant" ? "• " : ""}
//               {item.content}
//             </Text>
//           </View>
//         )}
//       />

//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         keyboardVerticalOffset={80}
//       >
//         <View style={styles.inputRow}>
//           <TextInput
//             style={styles.textInput}
//             placeholder="Describe your incident..."
//             placeholderTextColor="#aaa"
//             value={input}
//             onChangeText={setInput}
//             multiline
//           />
//           <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//             <MessageCircle size={24} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 70, paddingHorizontal: 12 },
//   title: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#fff",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   messageBubble: {
//     marginVertical: 6,
//     padding: 12,
//     borderRadius: 12,
//     maxWidth: "80%",
//   },
//   userBubble: {
//     alignSelf: "flex-end",
//     backgroundColor: "#9d6200",
//   },
//   assistantBubble: {
//     alignSelf: "flex-start",
//     backgroundColor: "#fff",
//   },
//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 12,
//     backgroundColor: "#1a1a1a",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   textInput: {
//     flex: 1,
//     minHeight: 44,
//     maxHeight: 120,
//     fontSize: 16,
//     color: "#fff",
//   },
//   sendButton: {
//     marginLeft: 8,
//     backgroundColor: "#9d6200",
//     padding: 10,
//     borderRadius: 50,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default LegalAssistant;




// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import Constants from "expo-constants";
// import { MessageCircle } from "lucide-react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import BackButton from "../../components/UI/BackButton";
// import { supabase } from "../../services/supabaseClient";
// import { useNavigation } from "@react-navigation/native";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // 📚 Import datasets (place JSON files in /data folder)
// import incidentDataset from "../../JSONDATA/incidentDataset.json";
// import legalSections from "../../JSONDATA/legalSections.json";

// // 🔑 API Keys from .env via app.json → extra
// const { GEMINI_API_KEY, SERPAPI_KEY } = Constants.expoConfig.extra;
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// // 🟢 System Prompt
// const SYSTEM_PROMPT = `
// You are a compassionate AI Legal Assistant specialized in Indian law.
// Always listen empathetically, never judge, and provide clear step-by-step guidance.
// Map incidents to IPC/PWDVA laws where possible, and explain rights + next actions.
// Use simple, reassuring language.
// `;

// // 🔎 Web Search Fallback (SerpAPI)
// const searchWeb = async (query) => {
//   try {
//     const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
//       query + " Indian law domestic violence IPC PWDVA site:.gov.in OR site:.nic.in"
//     )}&api_key=${SERPAPI_KEY}`;

//     const res = await fetch(url);
//     const data = await res.json();

//     if (data.organic_results && data.organic_results.length > 0) {
//       return data.organic_results
//         .slice(0, 3)
//         .map((r, i) => `🔗 ${i + 1}. ${r.title} — ${r.link}`)
//         .join("\n");
//     } else {
//       return "I couldn’t find any reliable online references at the moment.";
//     }
//   } catch (err) {
//     console.error("Web search error:", err);
//     return "Error fetching online legal references.";
//   }
// };

// // 🟠 Cosine Similarity Helper
// function cosineSimilarity(vecA, vecB) {
//   let dot = 0.0,
//     normA = 0.0,
//     normB = 0.0;
//   for (let i = 0; i < vecA.length; i++) {
//     dot += vecA[i] * vecB[i];
//     normA += vecA[i] * vecA[i];
//     normB += vecB[i] * vecB[i];
//   }
//   return dot / (Math.sqrt(normA) * Math.sqrt(normB));
// }

// // 🟠 Get Embeddings from Gemini
// async function getEmbedding(text) {
//   const model = genAI.getGenerativeModel({ model: "embedding-001" });
//   const result = await model.embedContent(text);
//   return result.embedding.values;
// }

// // 🟠 Search Incident Dataset + Legal Sections
// async function searchWithEmbeddings(userText) {
//   const userEmbedding = await getEmbedding(userText);

//   let bestMatch = null;
//   let bestScore = -1;

//   // Incident dataset search
//   for (let entry of incidentDataset) {
//     const entryEmbedding = await getEmbedding(entry.user_incident_text);
//     const score = cosineSimilarity(userEmbedding, entryEmbedding);
//     if (score > bestScore) {
//       bestScore = score;
//       bestMatch = {
//         source: "incidentDataset",
//         abuse_type: entry.abuse_type,
//         ipc_section: entry.ipc_section,
//         ipc_description: entry.ipc_description,
//         pwdva_section: entry.pwdva_section,
//         pwdva_description: entry.pwdva_description,
//       };
//     }
//   }

//   // Legal sections search
//   for (let section of legalSections) {
//     const entryEmbedding = await getEmbedding(
//       section.title + " " + section.description
//     );
//     const score = cosineSimilarity(userEmbedding, entryEmbedding);
//     if (score > bestScore) {
//       bestScore = score;
//       bestMatch = {
//         source: "legalSections",
//         ipc_section: section.section,
//         ipc_description: section.description,
//         pwdva_section: section.pwdva_section || "",
//         pwdva_description: section.pwdva_description || "",
//       };
//     }
//   }

//   return bestScore > 0.65 ? bestMatch : null;
// }

// // 🟠 Fallback → Gemini reasoning
// async function fallbackGemini(userText) {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
//   const prompt = `
//   User incident: "${userText}".
//   Suggest relevant IPC and PWDVA sections with explanations.
//   If no match, reply "not found".
//   `;
//   const result = await model.generateContent(prompt);
//   return { source: "gemini", guidance: result.response.text() };
// }

// // ==================== MAIN COMPONENT ====================
// const LegalAssistant = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const navigation = useNavigation();

//   useEffect(() => {
//     setMessages([]); // Clear on mount
//   }, []);

//   // 💾 Save chat to Supabase
//   const saveMessage = async (msg) => {
//     setMessages((prev) => [...prev, msg]);
//     try {
//       const { error } = await supabase.from("chat_history").insert({
//         role: msg.role,
//         content: msg.content,
//         created_at: new Date(),
//       });
//       if (error) console.error("Supabase insert error:", error.message);
//     } catch (err) {
//       console.error("Supabase request failed:", err);
//     }
//   };

//   // 📩 Handle Send
//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { role: "user", content: input }];
//     setInput("");

//     // Step 1: Try semantic search in datasets
//     let match = await searchWithEmbeddings(input);
//     let reply = "";

//     if (match) {
//       reply = `I understand your incident. Based on Indian law, here’s what applies:\n\n📜 IPC Section: ${match.ipc_section}\n${match.ipc_description}\n\n📜 PWDVA Section: ${match.pwdva_section}\n${match.pwdva_description}\n👉 You can report this at your nearest police station or seek protection orders under PWDVA.`;
//     } else {
//       // Step 2: Try Gemini fallback
//       const geminiResponse = await fallbackGemini(input);
//       if (geminiResponse.guidance && !geminiResponse.guidance.includes("not found")) {
//         reply = geminiResponse.guidance;
//       } else {
//         // Step 3: Fallback → Web Search
//         const webResults = await searchWeb(input);
//         reply = `🌐 I couldn’t find a direct IPC/PWDVA match in the dataset.\nHere are some reliable references:\n${webResults}`;
//       }
//     }

//     const updatedMessages = [
//       ...newMessages,
//       { role: "assistant", content: reply },
//     ];

//     await saveMessage({ role: "user", content: input });
//     await saveMessage({ role: "assistant", content: reply });

//     setMessages(updatedMessages);
//   };

//   return (
//     <LinearGradient colors={["#000", "#9d6200", "#000"]} style={styles.container}>
//       <BackButton onPress={() => navigation.goBack()} />
//       <Text style={styles.title}>Legal Assistant</Text>

//       <FlatList
//         data={messages}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View
//             style={[
//               styles.messageBubble,
//               item.role === "user" ? styles.userBubble : styles.assistantBubble,
//             ]}
//           >
//             <Text style={{ color: item.role === "user" ? "#fff" : "#000" }}>
//               {item.role === "assistant" ? "• " : ""}
//               {item.content}
//             </Text>
//           </View>
//         )}
//       />

//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         keyboardVerticalOffset={80}
//       >
//         <View style={styles.inputRow}>
//           <TextInput
//             style={styles.textInput}
//             placeholder="Describe your incident..."
//             placeholderTextColor="#aaa"
//             value={input}
//             onChangeText={setInput}
//             multiline
//           />
//           <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//             <MessageCircle size={24} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 70, paddingHorizontal: 12 },
//   title: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#fff",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   messageBubble: {
//     marginVertical: 6,
//     padding: 12,
//     borderRadius: 12,
//     maxWidth: "80%",
//   },
//   userBubble: {
//     alignSelf: "flex-end",
//     backgroundColor: "#9d6200",
//   },
//   assistantBubble: {
//     alignSelf: "flex-start",
//     backgroundColor: "#fff",
//   },
//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 12,
//     backgroundColor: "#1a1a1a",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   textInput: {
//     flex: 1,
//     minHeight: 44,
//     maxHeight: 120,
//     fontSize: 16,
//     color: "#fff",
//   },
//   sendButton: {
//     marginLeft: 8,
//     backgroundColor: "#9d6200",
//     padding: 10,
//     borderRadius: 50,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default LegalAssistant;



import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import { MessageCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import BackButton from "../../components/UI/BackButton";
import { supabase } from "../../services/supabaseClient";
import { useNavigation } from "@react-navigation/native";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Import datasets
import incidentDataset from "../../JSONDATA/incidentDataset.json";
import legalSections from "../../JSONDATA/legalSections.json";

// API keys
const { GEMINI_API_KEY, SERPAPI_KEY } = Constants.expoConfig.extra;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// System Prompt
const SYSTEM_PROMPT = `
You are a compassionate AI Legal Assistant specialized in Indian law.
Always listen empathetically, never judge, and provide clear step-by-step guidance.
Map incidents to IPC/PWDVA laws where possible, and explain rights + next actions.
Use simple, reassuring language.
`;

// ================= Helper Functions =================

// Cosine similarity
function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Search local datasets using embeddings
async function searchLocal(userText) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const userEmbedding = (await model.embedContent(userText)).embedding.values;

    let bestScore = -1;
    let bestMatch = null;

    // Incident dataset
    for (let entry of incidentDataset) {
      const entryEmbedding = (await model.embedContent(entry.user_incident_text)).embedding.values;
      const score = cosineSimilarity(userEmbedding, entryEmbedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    // Legal sections
    for (let section of legalSections) {
      const entryEmbedding = (await model.embedContent(section.title + " " + section.description)).embedding.values;
      const score = cosineSimilarity(userEmbedding, entryEmbedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = section;
      }
    }

    return bestScore > 0.65 ? bestMatch : null;
  } catch (err) {
    console.error("Local search error:", err);
    return null;
  }
}

// Gemini 2.5 Flash AI fallback
async function callGemini(userText, history) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
            ...history.map((h) => ({ role: h.sender, parts: [{ text: h.text }] })),
            { role: "user", parts: [{ text: userText }] },
          ],
        }),
      }
    );

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .filter(Boolean)
        .join("\n") || "";

    return reply.trim() || "I understand your incident. It may fall under IPC Section 351 or 498A. Please document it and report to the police.";
  } catch (err) {
    console.error("Gemini 2.5 error:", err);
    return "Error reaching legal knowledge sources. Please try again later.";
  }
}

// 🌐 SerpAPI fallback
const searchWeb = async (query) => {
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      query + " Indian law domestic violence IPC PWDVA site:.gov.in OR site:.nic.in"
    )}&api_key=${SERPAPI_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.organic_results && data.organic_results.length > 0) {
      return data.organic_results
        .slice(0, 3)
        .map((r, i) => `🔗 ${i + 1}. ${r.title} — ${r.link}`)
        .join("\n");
    } else {
      return "I couldn’t find reliable online references at the moment.";
    }
  } catch (err) {
    console.error("Web search error:", err);
    return "Error fetching online legal references.";
  }
};

// Supabase save message
async function saveMessage(msg) {
  try {
    await supabase.from("chat_history").insert({
      role: msg.sender,
      content: msg.text,
      created_at: new Date(),
    });
  } catch (err) {
    console.error("Supabase insert error:", err);
  }
}

// ==================== MAIN COMPONENT ====================
const LegalAssistant = () => {
  const [messages, setMessages] = useState([]); // local in-phone messages
  const [input, setInput] = useState("");
  const navigation = useNavigation();

  // Clear local chat on mount
  useEffect(() => {
    setMessages([]); // clear previous chats locally, Supabase retains history
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    await saveMessage({ sender: "user", text: input });

    // Step 1: Search local datasets
    const match = await searchLocal(input);
    let reply = "";

    if (match) {
      reply = `I understand your incident. Based on Indian law:\n\n📜 IPC Section: ${match.ipc_section || match.section}\n${match.ipc_description || match.description}\n\n📜 PWDVA Section: ${match.pwdva_section || ""}\n${match.pwdva_description || ""}\n\n👉 You can report this at your nearest police station or seek protection orders under PWDVA.`;
    } else {
      // Step 2: Gemini fallback
      const gemReply = await callGemini(input, newMessages);

      if (!gemReply || gemReply.toLowerCase().includes("not found")) {
        // Step 3: SerpAPI fallback
        const webResults = await searchWeb(input);
        reply = `🌐 I couldn’t find a direct IPC/PWDVA match in the dataset or Gemini.\nHere are some reliable references:\n${webResults}`;
      } else {
        reply = gemReply;
      }
    }

    const assistantMsg = { sender: "assistant", text: reply };
    setMessages((prev) => [...prev, assistantMsg]);
    await saveMessage(assistantMsg);
    setInput("");
  };

  return (
    <LinearGradient colors={["#000", "#9d6200", "#fff"]} style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Legal Assistant</Text>

      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={{ color: item.sender === "user" ? "#fff" : "#000" }}>
              {item.sender === "assistant" ? "• " : ""}
              {item.text}
            </Text>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your incident..."
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <MessageCircle size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// ==================== Styles ====================
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 12 },
  title: { fontSize: 26, fontWeight: "700", color: "#fff", marginBottom: 16, textAlign: "center" },
  messageBubble: { marginVertical: 6, padding: 12, borderRadius: 12, maxWidth: "80%" },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#9d6200" },
  assistantBubble: { alignSelf: "flex-start", backgroundColor: "#fff" },
  inputRow: { flexDirection: "row", alignItems: "center", marginVertical: 12, backgroundColor: "#1a1a1a", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  textInput: { flex: 1, minHeight: 44, maxHeight: 120, fontSize: 16, color: "#fff" },
  sendButton: { marginLeft: 8, backgroundColor: "#9d6200", padding: 10, borderRadius: 50, justifyContent: "center", alignItems: "center" },
});

export default LegalAssistant;
