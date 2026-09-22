const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
(async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH),
        scopes: ["https://www.googleapis.com/auth/drive"]
    });
    const drive = google.drive({ version: "v3", auth });
    const dr = await drive.drives.list({ pageSize: 20 });
    console.log("Shared drives visibles:", JSON.stringify(dr.data.drives || []));
    const info = await drive.files.get({ fileId: "1ipvNm0ODa_hshBJMziid_D4POdq7l9ni", fields: "id, name, driveId, parents" });
    console.log("Carpeta:", JSON.stringify(info.data));
})();
