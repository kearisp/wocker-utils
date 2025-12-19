export class ProgressBar {
    protected progress: number = 0;

    public constructor(
        protected label?: string,
        protected readonly stdout = process.stdout
    ) {}

    public start(): void {
        this.render();
    }

    public stop(): void {
        this.stdout.write("\n");
    }

    public update(progress: number, label?: string): void {
        this.progress = progress;

        if(label) {
            this.label = label;
        }

        this.render();
    }

    public render() {
        const [consoleWidth] = this.stdout.getWindowSize(),
              label = this.label || "Processing",
              percentage = this.progress.toString().padStart(3, " ") + "%",
              width = Math.min(100, consoleWidth - label.length - percentage.length - 5),
              filled = Math.round(width * this.progress / 100),
              bar = "█".repeat(Math.min(width, filled)) + "░".repeat(Math.max(0, width - filled));

        this.stdout.write(`\r${label}: ${bar} ${percentage}`);
    }
}
