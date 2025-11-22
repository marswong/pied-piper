require('dotenv/config');
const { Sandbox } = require('e2b');

export async function POST(req, res) {
	try {
		const formData = await req.formData();
		const file = formData.get('file');

		if (!file) {
			return res.status(400).json({ message: 'No file uploaded' });
		}

		/** @type {import('e2b').Sandbox} */
		const sbx = await Sandbox.create({
			envs: {
				ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
			},
			mcp: {
				ffmpeg: {},
			},
		});

		const mcpUrl = sbx.getMcpUrl();
		const mcpToken = await sbx.getMcpToken();

		await sbx.commands.run(
			`claude mcp add --transport http e2b-mcp-gateway ${mcpUrl} --header "Authorization: Bearer ${mcpToken}"`,
			{
				timeoutMs: 0,
				onStdout: console.log,
				onStderr: console.log
			}
		);

		const buffer = Buffer.from(await file.arrayBuffer());
		await sbx.files.write('/home/user/upload', buffer);
		/** @type {import('e2b').CommandHandle} */
		const commandHandle = await sbx.commands.run(
			`echo 'Use ffmpeg to compress the image at /home/user/upload, and output to /home/user/output.' | claude -p --dangerously-skip-permissions`,
			{
				timeoutMs: 0,
				background: true,
				onStdout: console.log,
				onStderr: console.log,
			}
		)

		return res.status(200).json({ id: sbx.sandboxId, pid: commandHandle.pid });
	} catch (err) {
		console.error('Error uploading image:', err);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
}

export async function GET(req, res) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');

	if (!id) {
		return res.status(400).json({ message: 'job id is required' });
	}

	/** @type {import('e2b').Sandbox} */
	const sbx = await Sandbox.connect(id);
	const content = await sbx.files.read('/home/user/output');

	if (!content) {
		return res.status(200).json({ status: 'running' });
	}

	return res.status(200).json({ status: 'completed', file: content.toString('base64') });
}
