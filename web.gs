// Global variable for your spreadsheet
const ss = SpreadsheetApp.openById("1t1z1Q0_V-cZ_LotL_n5o1oi5AtJw3nGRHgPcxLLYtac");

// UPDATED Main function to handle case-insensitivity

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Project Tracker Web App [DEMO]')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
// UPDATED Helper Function to handle case-insensitivity
function getAuthorizedEmails() {
  try {
    const teamSheet = ss.getSheetByName("Team");
    if (!teamSheet || teamSheet.getLastRow() < 2) return new Set();
    const emailRange = teamSheet.getRange(2, 3, teamSheet.getLastRow() - 1, 1);
    const emails = emailRange.getValues().flat().filter(Boolean);
    // Convert all emails from the sheet to lowercase before adding to the Set
    return new Set(emails.map(email => email.toLowerCase())); 
  } catch (e) {
    console.error("Error in getAuthorizedEmails: " + e.toString());
    return new Set();
  }
}
// UPDATED getInitialData to be Role-Aware
function getInitialData() {
  const userRole = "Admin";
  const allTasks = getTasksForWebApp();
  return {
    userEmail: "public.demo@example.com",
    userName: "Demo User",
    userRole: userRole,
    tasks: allTasks,
    team: getTeamMembers(),
    dashboard: getDashboardStats(allTasks),
    tasksPerMember: getTasksPerMember(),
    teamStats: getTeamStats()
  };
}
// Function to get team stats
function getTeamStats() { const team = getTeamMembers(); return { totalMembers: team.length }; }
// Function to get tasks
// === YEH FUNCTION UPDATE HUA HAI - Visual Cues ke liye ===
function getTasksForWebApp() {
  const taskSheet = ss.getSheetByName("Tasks");
  if (!taskSheet || taskSheet.getLastRow() < 2) return [];

  const data = taskSheet.getDataRange().getValues();
  const headers = data.shift().map(h => String(h).trim());
  
  // Column indices
  const idIndex = headers.indexOf("Task ID"),
        titleIndex = headers.indexOf("Task Title"),
        assigneeIndex = headers.indexOf("Assignee"),
        assigneeEmailIndex = headers.indexOf("Assignee Email"),
        statusIndex = headers.indexOf("Status"),
        priorityIndex = headers.indexOf("Priority"),
        dueDateIndex = headers.indexOf("Due Date");

  // NAYA LOGIC SHURU: Overdue status check karne ke liye
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Time ko ignore karne ke liye

  return data.map(row => {
    const dueDateValue = row[dueDateIndex];
    const status = row[statusIndex];
    let isOverdue = false;
    
    // Task sirf tabhi overdue hai jab uska due date aaj se pehle ka ho AUR uska status 'Done' na ho
    if (dueDateValue && status !== 'Done') {
      const dueDate = new Date(dueDateValue);
      dueDate.setHours(0, 0, 0, 0); // Time ko ignore karne ke liye
      if (dueDate < today) {
        isOverdue = true;
      }
    }
    // NAYA LOGIC KHATAM

    return {
      id: row[idIndex],
      title: row[titleIndex],
      assignee: row[assigneeIndex],
      assigneeEmail: row[assigneeEmailIndex],
      status: row[statusIndex],
      priority: row[priorityIndex],
      dueDate: dueDateValue ? new Date(dueDateValue).toLocaleDateString() : "",
      isOverdue: isOverdue // <-- YEH NAYI PROPERTY ADD HUI HAI
    };
  });
}
// Function to get team members
// UPDATED to include the Role
// STEP 1: UPDATED to include the Role
function getTeamMembers() {
  const teamSheet = ss.getSheetByName("Team");
  if (!teamSheet || teamSheet.getLastRow() < 2) return [];
  const data = teamSheet.getDataRange().getValues();
  const headers = data.shift().map(h => String(h).trim());

  // Get column indices
  const idIndex = headers.indexOf("Assignee ID"), nameIndex = headers.indexOf("Name"), 
        emailIndex = headers.indexOf("Email"), dobIndex = headers.indexOf("Date of Birth"),
        addressIndex = headers.indexOf("Address"), ageIndex = headers.indexOf("Age"),
        roleIndex = headers.indexOf("Role"); // <-- Naya index

  return data.map(row => ({
    id: row[idIndex], name: row[nameIndex], email: row[emailIndex], 
    dob: row[dobIndex] ? new Date(row[dobIndex]).toLocaleDateString() : "", 
    address: row[addressIndex], age: row[ageIndex],
    role: row[roleIndex] || 'Member' // <-- Nayi property add hui
  }));
}
// UPDATE getDashboardStats to accept filtered tasks
function getDashboardStats(tasks) {
  const defaultStats = { total: 0, todo: 0, inProgress: 0, done: 0 };
  if (!tasks || tasks.length === 0) return defaultStats;
  
  let stats = { total: tasks.length, todo: 0, inProgress: 0, done: 0 };
  tasks.forEach(task => {
    if (task.status === 'To Do') stats.todo++;
    else if (task.status === 'In Progress') stats.inProgress++;
    else if (task.status === 'Done') stats.done++;
  });
  return stats;
}
// Function to get task counts per member
function getTasksPerMember() {
  try {
    const sheet = ss.getSheetByName("Tasks"); if (sheet.getLastRow() < 2) return [];
    const data = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues(); const counts = {};
    data.forEach(row => { const assignee = row[0]; if (assignee) { counts[assignee] = (counts[assignee] || 0) + 1; } });
    return Object.entries(counts);
  } catch (e) { console.error("getTasksPerMember Error: " + e.toString()); return []; }
}
// Function to add a new task
function addNewTask(taskData) {
  try {
    const tasksSheet = ss.getSheetByName("Tasks"); const teamSheet = ss.getSheetByName("Team"); const lastRow = tasksSheet.getLastRow();
    const allIDs = lastRow > 1 ? tasksSheet.getRange(2, 1, lastRow - 1, 1).getValues().flat() : [];
    const lastNum = allIDs.reduce((max, id) => { if (!id || typeof id.split !== 'function') return max; const numPart = id.split('-')[1]; const num = numPart ? parseInt(numPart) : 0; return !isNaN(num) && num > max ? num : max; }, 0);
    const newID = "TSK-" + ("000" + (lastNum + 1)).slice(-3);
    const teamData = teamSheet.getDataRange().getValues(); let assigneeEmail = "";
    for (let i = 1; i < teamData.length; i++) { if (teamData[i][1] === taskData.assignee) { assigneeEmail = teamData[i][2]; break; } }
    tasksSheet.appendRow([newID, taskData.title, taskData.assignee, assigneeEmail, taskData.priority, taskData.status, new Date(taskData.dueDate), new Date(), false, false]);
    tasksSheet.getRange(tasksSheet.getLastRow(), 7).setNumberFormat("yyyy-mm-dd");
    SpreadsheetApp.flush(); return { status: "success", message: "✅ Task '" + taskData.title + "' added successfully!" };
  } catch (e) { console.error("CRITICAL Error in addNewTask: " + e.toString()); return { status: "error", message: "Failed to add task. Error: " + e.toString() }; }
}

// === YEH FUNCTION AB THEEK KAR DIYA GAYA HAI ===
function updateTask(taskData) {
  try {
    const tasksSheet = ss.getSheetByName("Tasks");
    const data = tasksSheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) { if (data[i][0] == taskData.id) { rowIndex = i + 1; break; } }
    if (rowIndex === -1) { return { status: "error", message: "Task not found. It may have been deleted." }; }
    
    const teamSheet = ss.getSheetByName("Team");
    const teamData = teamSheet.getDataRange().getValues();
    let assigneeEmail = "";
    for (let i = 1; i < teamData.length; i++) { if (teamData[i][1] === taskData.assignee) { assigneeEmail = teamData[i][2]; break; } }

    // SAHI TARTEEB: Priority pehle, Status baad mein
    const updatedValues = [
        taskData.title,
        taskData.assignee,
        assigneeEmail,
        taskData.priority, // Sahi Position
        taskData.status,   // Sahi Position
        new Date(taskData.dueDate)
    ];

    // Range (B se G) mein 6 columns hain
    tasksSheet.getRange(rowIndex, 2, 1, 6).setValues([updatedValues]);
    return { status: "success", message: "Task updated successfully!" };
  } catch (e) { console.error("Error in updateTask: " + e.toString()); return { status: "error", message: "Failed to update task. Error: " + e.toString() }; }
}


// === MEMBER-ONLY SECURE FUNCTION ===
function updateMyTaskStatus(taskData) {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    const tasksSheet = ss.getSheetByName("Tasks");
    const data = tasksSheet.getDataRange().getValues();
    let rowIndex = -1;
    let taskAssigneeEmail = "";
    
    // Find the task in the sheet
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == taskData.id) { // Column A is Task ID
        rowIndex = i + 1;
        taskAssigneeEmail = data[i][3]; // Column D is Assignee Email
        break;
      }
    }

    if (rowIndex === -1) {
      return { status: "error", message: "Task not found." };
    }

    // SECURITY CHECK: Is the logged-in user the owner of this task?
    if (userEmail.toLowerCase() !== taskAssigneeEmail.toLowerCase()) {
      return { status: "error", message: "Security Error: You can only update your own tasks." };
    }

    // Member is only allowed to change Priority (Col E) and Status (Col F)
    // NOTE: Column E is index 4, F is index 5
    tasksSheet.getRange(rowIndex, 5).setValue(taskData.priority); // Column E
    tasksSheet.getRange(rowIndex, 6).setValue(taskData.status);   // Column F

    return { status: "success", message: "Task status updated successfully!" };

  } catch (e) {
    console.error("Error in updateMyTaskStatus: " + e.toString());
    return { status: "error", message: "Failed to update task. Error: " + e.toString() };
  }
}

// Function to delete a task
function deleteTask(taskId) { try { const tasksSheet = ss.getSheetByName("Tasks"), data = tasksSheet.getDataRange().getValues(); let rowIndex = -1; for (let i = 1; i < data.length; i++) { if (data[i][0] == taskId) { rowIndex = i + 1; break; } } if (rowIndex !== -1) { tasksSheet.deleteRow(rowIndex); return { status: "success", message: "Task successfully deleted." }; } else { return { status: "error", message: "Error: Task not found." }; } } catch (e) { console.error("Error in deleteTask: " + e.toString()); return { status: "error", message: "Failed to delete task. Error: " + e.toString() }; } }
// Function to add a new team member
// web.gs

function addNewTeamMember(memberData) {
  const teamSheet = ss.getSheetByName("Team");
  try {
    const emailColumn = teamSheet.getRange("C2:C").getValues().flat();
    if (emailColumn.includes(memberData.email)) {
        return { status: "error", message: `Error: Email '${memberData.email}' is already registered.` };
    }
    const dob = new Date(memberData.dob);
    const age = calculateAge(dob);
    
    // ID generate karne ka behtar tareeqa, jo khali sheet par bhi kaam karega.
    const lastRow = teamSheet.getLastRow();
    const allIDs = lastRow > 1 ? teamSheet.getRange(2, 1, lastRow - 1, 1).getValues().flat() : [];
    const lastNum = allIDs.reduce((max, id) => { if (!id || typeof id.split !== 'function') return max; const numPart = id.split('-')[1]; const num = numPart ? parseInt(numPart) : 0; return !isNaN(num) && num > max ? num : max; }, 0);
    const newId = "EMP-" + ("000" + (lastNum + 1)).slice(-3);
    
    // *** Yahan se permission dene wala logic hata diya gaya hai ***
    
    teamSheet.appendRow([newId, memberData.name, memberData.email, dob, memberData.address, age, 'Member']);
    SpreadsheetApp.flush();

    // Success message ko demo ke liye behtar banaya gaya hai.
    return { status: "success", message: `✅ Demo Member '${memberData.name}' has been added to the list.` };

  } catch (e) {
    console.error("Critical Error in addNewTeamMember: " + e.toString());
    return { status: "error", message: "Failed to add member. Error: " + e.toString() };
  }
}
// Helper function to calculate age
function calculateAge(birthDate) { const today = new Date; let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; }
// Function to synchronize assignee name
function synchronizeAssigneeNameInTasks(memberEmail, newName) { const tasksSheet = ss.getSheetByName("Tasks"); if (tasksSheet.getLastRow() < 2) return; const data = tasksSheet.getDataRange().getValues(), headers = data.shift().map(h => String(h).trim()), assigneeNameIndex = headers.indexOf("Assignee"), assigneeEmailIndex = headers.indexOf("Assignee Email"); data.forEach((row, index) => { if (row[assigneeEmailIndex] === memberEmail) { tasksSheet.getRange(index + 2, assigneeNameIndex + 1).setValue(newName); } }); }
// Function to update an existing team member
// STEP 3: UPDATED to allow Role editing by Admin only
function updateTeamMember(memberData) {
  // SECURITY CHECK: Sirf Admin hi is function ko chala sakta hai.
  const userRole = getRoleForEmail(Session.getActiveUser().getEmail());
  if (userRole !== 'Admin') {
    return { status: "error", message: "Security Breach: Only Admins can modify team members." };
  }

  try {
    const teamSheet = ss.getSheetByName("Team");
    const data = teamSheet.getDataRange().getValues();
    let rowIndex = -1, originalEmail = "";
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == memberData.id) {
            rowIndex = i + 1;
            originalEmail = data[i][2]; // Email is in column C
            break;
        }
    }
    if (rowIndex === -1) return { status: "error", message: "Member not found." };
    
    const dob = new Date(memberData.dob);
    const age = calculateAge(dob);
    
    // Range ab G tak (6 columns B se G tak) update hogi
    // B=Name, C=Email, D=DOB, E=Address, F=Age, G=Role
    teamSheet.getRange(rowIndex, 2, 1, 6).setValues([
      [memberData.name, originalEmail, dob, memberData.address, age, memberData.role]
    ]);

    synchronizeAssigneeNameInTasks(originalEmail, memberData.name);
    SpreadsheetApp.flush();
    return { status: "success", message: "Member details updated successfully." };
  } catch (e) {
    console.error("Error in updateTeamMember: " + e.toString());
    return { status: "error", message: "Failed to update member. Error: " + e.toString() };
  }
}
// Function to check for active tasks
function hasActiveTasks(assigneeEmail) { const sheet = ss.getSheetByName("Tasks"); if (sheet.getLastRow() < 2) return !1; const data = sheet.getRange(2, 4, sheet.getLastRow() - 1, 3).getValues(); for (let i = 0; i < data.length; i++) { if (data[i][0] === assigneeEmail && data[i][2] !== 'Done') return !0; } return !1; }
// Function to delete a team member
// web.gs

function deleteTeamMember(memberId) {
  try {
    const teamSheet = ss.getSheetByName("Team");
    const data = teamSheet.getDataRange().getValues();
    let rowIndex = -1, memberEmail = "", memberName = "";
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == memberId) {
            rowIndex = i + 1; memberName = data[i][1]; memberEmail = data[i][2]; break;
        }
    }
    if (rowIndex === -1) return { status: "error", message: "Member not found." };
    if (hasActiveTasks(memberEmail)) return { status: "error", message: `Cannot delete '${memberName}'. They have unfinished tasks.` };
    
    // *** Yahan se permission hatane wala logic hata diya gaya hai ***

    teamSheet.deleteRow(rowIndex);
    SpreadsheetApp.flush();
    return { status: "success", message: `'${memberName}' has been deleted.` };
    
  } catch (e) {
    console.error("Error in deleteTeamMember: " + e.toString());
    return { status: "error", message: "Failed to delete member. Error: " + e.toString() };
  }
}




// === UPGRADED: CONSOLIDATED AUTOMATED REMINDERS ===
function sendAutomatedReminders() {
  const tasksSheet = ss.getSheetByName("Tasks");
  if (tasksSheet.getLastRow() < 2) return;

  const dataRange = tasksSheet.getDataRange();
  const allValues = dataRange.getValues();
  const headers = allValues.shift().map(h => String(h).trim());

  const titleIndex = headers.indexOf("Task Title");
  const assigneeIndex = headers.indexOf("Assignee");
  const assigneeEmailIndex = headers.indexOf("Assignee Email");
  const statusIndex = headers.indexOf("Status");
  const dueDateIndex = headers.indexOf("Due Date");
  const notificationStatusIndex = headers.indexOf("Notification Status");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Phase 1: Saare zaroori tasks ko user ke hisab se jama karna
  const emailsToSend = {}; // Key: assigneeEmail, Value: { name: 'Assignee Name', tasks: [...] }

  allValues.forEach((row, index) => {
    const status = row[statusIndex];
    const assigneeEmail = row[assigneeEmailIndex];
    const notificationStatus = row[notificationStatusIndex];
    
    if (status === 'Done' || !assigneeEmail) {
      return; // Done tasks ya jin ka email nahi, unhe ignore karo
    }

    const dueDate = new Date(row[dueDateIndex]);
    dueDate.setHours(0, 0, 0, 0);
    const daysDiff = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    
    let taskCategory = null;
    let newNotificationStatus = "";

    if (daysDiff < 0 && notificationStatus !== 'Overdue Sent') {
      taskCategory = 'Overdue';
      newNotificationStatus = 'Overdue Sent';
    } else if (daysDiff === 0 && notificationStatus !== 'Due Today Sent') {
      taskCategory = 'Due Today';
      newNotificationStatus = 'Due Today Sent';
    } else if (daysDiff > 0 && daysDiff <= 5 && notificationStatus !== 'Reminder Sent') {
      taskCategory = 'Upcoming';
      newNotificationStatus = 'Reminder Sent';
    }

    if (taskCategory) {
      if (!emailsToSend[assigneeEmail]) {
        emailsToSend[assigneeEmail] = {
          name: row[assigneeIndex],
          tasks: []
        };
      }
      emailsToSend[assigneeEmail].tasks.push({
        title: row[titleIndex],
        dueDate: dueDate.toLocaleDateString(),
        category: taskCategory,
        notificationStatus: newNotificationStatus,
        rowIndex: index + 2 // Sheet mein row ka number save karlo
      });
    }
  });

  // Phase 2: Jama kiye hue data se har user ke liye ek email bhejna
  for (const email in emailsToSend) {
    const userData = emailsToSend[email];
    const summarySubject = `Your Daily Task Summary - Project Tracker`;
    
    // Email ko sections mein organize karna
    const overdueTasks = userData.tasks.filter(t => t.category === 'Overdue').map(t => `<li><b>${t.title}</b> (Was due on: ${t.dueDate})</li>`).join('');
    const dueTodayTasks = userData.tasks.filter(t => t.category === 'Due Today').map(t => `<li><b>${t.title}</b> (Due: ${t.dueDate})</li>`).join('');
    const upcomingTasks = userData.tasks.filter(t => t.category === 'Upcoming').map(t => `<li><b>${t.title}</b> (Due: ${t.dueDate})</li>`).join('');

    // Professional HTML Email Body
    let htmlBody = `
      <html><body>
      <h3>Hi ${userData.name},</h3>
      <p>Here is your daily summary of tasks from the Project Tracker:</p>`;

    if (overdueTasks.length > 0) {
      htmlBody += `
        <h4 style="color: #d9534f;">URGENT: OVERDUE TASKS</h4>
        <p>Please take immediate action on the following tasks:</p>
        <ul>${overdueTasks}</ul>`;
    }
    if (dueTodayTasks.length > 0) {
      htmlBody += `
        <h4 style="color: #f0ad4e;">TASKS DUE TODAY</h4>
        <ul>${dueTodayTasks}</ul>`;
    }
    if (upcomingTasks.length > 0) {
      htmlBody += `
        <h4 style="color: #5bc0de;">UPCOMING TASKS</h4>
        <ul>${upcomingTasks}</ul>`;
    }

    htmlBody += `<p>Please visit the Project Tracker to update the status of your tasks.</p>
      <p>Thank you!</p>
      </body></html>`;
      
    try {
      // Consolidated email bhejna
      MailApp.sendEmail({
        to: email,
        subject: summarySubject,
        htmlBody: htmlBody
      });

      // Email bhejne ke baad, sabhi tasks ka status sheet mein update karna
      userData.tasks.forEach(task => {
        tasksSheet.getRange(task.rowIndex, notificationStatusIndex + 1).setValue(task.notificationStatus);
      });
      
    } catch (e) {
      console.error(`Failed to send summary email to ${email}. Error: ${e.toString()}`);
    }
  }
}

// STEP 2: Naya Helper function to get a user's role
function getRoleForEmail(email) {
    const teamSheet = ss.getSheetByName("Team");
    const data = teamSheet.getDataRange().getValues();
    // NOTE: Column C (index 2) is Email, Column G (index 6) is Role. Adjust if needed.
    for(let i = 1; i < data.length; i++) {
        if (data[i][2].toLowerCase() === email.toLowerCase()) {
            return data[i][6]; 
        }
    }
    return null; // User not found
}
// === YEH NAYA FUNCTION HAI - Tasks ko CSV mein export karne ke liye ===
function exportTasksToCsv(tasksToExport) {
  if (!tasksToExport || tasksToExport.length === 0) {
    return { status: "error", message: "No data to export." };
  }

  try {
    // CSV file ke liye headers
    const headers = ["Task ID", "Title", "Assignee", "Assignee Email", "Status", "Priority", "Due Date", "Is Overdue"];
    
    // Pehli row headers ki hogi
    let csvContent = headers.join(",") + "\n";

    // Har task object ko CSV ki ek row mein badalna
    tasksToExport.forEach(task => {
      // Data ko saaf karna taaki commas se CSV na toote
      const sanitizedTitle = '"' + String(task.title).replace(/"/g, '""') + '"';
      
      const row = [
        task.id,
        sanitizedTitle,
        task.assignee,
        task.assigneeEmail,
        task.status,
        task.priority,
        task.dueDate,
        task.isOverdue
      ].join(",");
      
      csvContent += row + "\n";
    });

    return { 
      status: "success", 
      csvData: csvContent,
      filename: `Tasks_Export_${new Date().toISOString().slice(0,10)}.csv`
    };

  } catch (e) {
    console.error("Error in exportTasksToCsv: " + e.toString());
    return { status: "error", message: "Failed to generate CSV. Error: " + e.toString() };
  }
}


// =========================================================================
// === FILE ATTACHMENT FUNCTIONS (USING ADVANCED DRIVE SERVICE) - FINAL CORRECTED ===
// =========================================================================

// Helper Function: Project ke liye dedicated folder hasil karna ya banana (FINAL CORRECTED)
function getOrCreateAttachmentsFolder() {
  const folderName = "Project Tracker Attachments";
  
  const response = Drive.Files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    maxResults: 1
  });

  if (response && response.items && response.items.length > 0) {
    return Drive.Files.get(response.items[0].id);
  } else {
    const folderResource = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };
    
    // Folder banane ke liye bhi 'create' istemal hoga, 'insert' nahi.
    const newFolder = Drive.Files.create(folderResource); 
    return newFolder;
  }
}

// Function: File ko Google Drive par upload karna (Yeh pehle se theek tha)
function uploadFileToDrive(fileObject, taskId) {
  try {
    const { base64Data, mimeType, fileName } = fileObject;
    
    const decodedData = Utilities.base64Decode(base64Data, Utilities.Charset.UTF_8);
    const blob = Utilities.newBlob(decodedData, mimeType, fileName);

    const folder = getOrCreateAttachmentsFolder();
    
    const fileResource = {
      name: fileName, 
      parents: [{ id: folder.id }]
    };

    const newFile = Drive.Files.create(fileResource, blob);

    const attachmentsSheet = ss.getSheetByName("Attachments") || ss.insertSheet("Attachments");
    if (attachmentsSheet.getLastRow() === 0) {
      attachmentsSheet.appendRow(["Attachment ID", "Task ID", "File Name", "File URL", "Uploaded By", "Timestamp"]);
    }
    
    const userEmail = Session.getActiveUser().getEmail();
    const newAttachmentId = "ATT-" + Utilities.getUuid();
    
    const fileUrl = newFile.webViewLink;

    attachmentsSheet.appendRow([
      newAttachmentId,
      taskId,
      newFile.name,
      fileUrl,
      userEmail,
      new Date()
    ]);
    
    return { 
      status: "success", 
      message: "File uploaded successfully!",
      fileInfo: {
        id: newAttachmentId,
        name: newFile.name,
        url: fileUrl
      }
    };
  } catch (e) {
    console.error("Error in uploadFileToDrive (Advanced): " + e.toString());
    return { status: "error", message: "Failed to upload file. Error: " + e.toString() };
  }
}

// Function: Ek specific task ke saare attachments fetch karna (Yeh pehle se theek tha)
function getAttachmentsForTask(taskId) {
  try {
    const attachmentsSheet = ss.getSheetByName("Attachments");
    if (!attachmentsSheet || attachmentsSheet.getLastRow() < 2) return [];
    const data = attachmentsSheet.getDataRange().getValues();
    const headers = data.shift();
    const taskIdIndex = headers.indexOf("Task ID");
    const idIndex = headers.indexOf("Attachment ID");
    const nameIndex = headers.indexOf("File Name");
    const urlIndex = headers.indexOf("File URL");
    const attachments = data.filter(row => row[taskIdIndex] == taskId).map(row => ({ id: row[idIndex], name: row[nameIndex], url: row[urlIndex] }));
    return attachments;
  } catch (e) {
    console.error("Error in getAttachmentsForTask: " + e.toString());
    return [];
  }
}
function deleteAttachment(attachmentId) {
  try {
    const attachmentsSheet = ss.getSheetByName("Attachments");
    if (!attachmentsSheet) {
      return { status: "error", message: "Attachments sheet not found." };
    }

    const data = attachmentsSheet.getDataRange().getValues();
    const headers = data.shift();
    const idIndex = headers.indexOf("Attachment ID");
    const urlIndex = headers.indexOf("File URL");

    let rowIndexToDelete = -1;
    let fileUrl = "";

    for (let i = 0; i < data.length; i++) {
      if (data[i][idIndex] === attachmentId) {
        rowIndexToDelete = i + 2; // +2 kyunke headers shift ho gaye aur sheet index 1 se shuru hota hai
        fileUrl = data[i][urlIndex];
        break;
      }
    }

    if (rowIndexToDelete === -1) {
      return { status: "error", message: "Attachment record not found in the sheet." };
    }

    // Step 1: Google Drive se file delete karna
    if (fileUrl) {
      try {
        const fileId = fileUrl.match(/\/d\/(.*?)\//)[1]; // URL se File ID nikalna
        Drive.Files.remove(fileId); // File ko trash mein bhejna
      } catch (driveError) {
        // Agar file Drive mein pehle se hi delete ho chuki hai, to sirf warning do aur aage barho
        console.warn(`Could not delete file from Drive (URL: ${fileUrl}). It might already be deleted. Error: ${driveError.toString()}`);
      }
    }

    // Step 2: Sheet se row delete karna
    attachmentsSheet.deleteRow(rowIndexToDelete);

    return { status: "success", message: "Attachment deleted successfully." };

  } catch (e) {
    console.error("Error in deleteAttachment: " + e.toString());
    return { status: "error", message: "Failed to delete attachment. Error: " + e.toString() };
  }
}
