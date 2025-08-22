import {exec} from "node:child_process";

// Function to execute a bash command
async function runBashCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {

            if (error) {
                console.error(`Error executing command: ${error.message}\n`);
            }
            if (stderr) {
                console.error(`Command stderr: ${stderr}\n`);
            }

            resolve(stdout)
        })
    });
}

async function onStart() {
    try {
        // Run bash command on start
        console.log('\nStarting supabase...\n');

        const result = await runBashCommand('/opt/homebrew/bin/supabase start && /opt/homebrew/bin/supabase status');

        console.log("Success: ", result, "\n")

        console.log("Press Ctrl+C or stop the process to terminate.\n")

        setInterval(() => {
        }, 1000); // Prevents script from exiting immediately
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

// Handle termination signals
async function handleTermination(signal) {
    try {
        console.log(`Stopping supabase...\n`);
        await runBashCommand('supabase stop');
        console.log('Supabase stopped!\n')
        process.exit(0);
    } catch (err) {
        console.error("An error occurred: ", err, "\n")
        process.exit(1)
    }
}

// Register signal handlers
process.on('SIGTERM', () => handleTermination('SIGTERM'));
process.on('SIGINT', () => handleTermination('SIGINT'));

onStart()