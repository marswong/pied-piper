require('dotenv/config');
const { Sandbox } = require('e2b');

export async function POST(req, res) {
	try {
		const formData = await req.formData();
		const file = formData.get('file');

		if (!file) {
			return res.status(400).json({ message: 'No file uploaded' });
		}

		console.log("Creating E2B sandbox...\n");
		/** @type {import('e2b').Sandbox} */
		const sbx = await Sandbox.create({
			envs: {
				ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
			},
		});

		// Add MCP server with authentication token
		console.log('Adding MCP server to Claude Code...');
		await sandbox.commands.run(
			`claude mcp add --transport http e2b-mcp-gateway ${mcpUrl} --header "Authorization: Bearer ${mcpToken}"`,
			{
				timeoutMs: 0,
				onStdout: console.log,
				onStderr: console.log
			}
		);

		const buffer = Buffer.from(await file.arrayBuffer());
		await sbx.files.write('/path/to/file', buffer)
		const filename = `${Date.now()}-${file.name}`;

		return res.status(200).json({ imageUrl: `/uploads/${filename}` });
	} catch (err) {
		console.error('Error uploading image:', err);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
}

export async function GET() {
	return Response.json({ message: 'pong' })
}
