import {
  Bar,
  Button,
  Caret,
  Collapse,
  Prompt,
  Stage,
  States,
  Window,
  type Act,
} from "@/stageshow/kit";
import { Check, Copy } from "lucide-react";
import { siGo } from "simple-icons";
import logo from "@/assets/white.png";
import "./clone-demo.css";

/*
 * Hero demo, built with Stageshow. One story: a template on BP Hub is
 * copied, pasted into a terminal and generated, setup commands included.
 * Beats: copy (1) → paste and clone (2) → bp gen runs pre, writes files,
 * runs post (3) → done, held (4) → `clear` resets the terminal (the loop's cause).
 */

const OWNER = "ukhirani";
const NAME = "go-server";
const ALIAS = "api";
const CLONE = `bp clone ${OWNER}/${NAME} --alias ${ALIAS}`;
const GEN = `bp gen ${ALIAS}`;

type S = {
  copied: boolean;
  pasted: string;
  cloned: boolean;
  gen: string;
  pre: boolean;
  files: number;
  post: boolean;
  done: boolean;
  clear: string;
};

const initial: S = {
  copied: false,
  pasted: "",
  cloned: false,
  gen: "",
  pre: false,
  files: 0,
  post: false,
  done: false,
  clear: "",
};

const POSTER: S = {
  ...initial,
  copied: true,
  pasted: CLONE,
  cloned: true,
  gen: GEN,
  pre: true,
  files: 3,
  post: true,
  done: true,
};

const FILES = ["main.go", "go.mod", "internal/server/server.go"];

async function script(a: Act<S>) {
  await a.wait(700);

  // 1. Copy the clone command from the template card
  await a.move("copy");
  await a.wait(200);
  await a.click();
  await a.set({ copied: true });
  await a.wait(500);

  // 2. Paste into the terminal and run it
  await a.move("term");
  await a.click();
  await a.key("cmd+v");
  await a.set({ pasted: CLONE });
  await a.wait(350);
  await a.key("enter");
  await a.set({ cloned: true });
  await a.wait(700);

  // 3. Generate: pre command, files, post command
  await a.type("gen", GEN, { interval: 55 });
  await a.wait(200);
  await a.key("enter");
  await a.set({ pre: true });
  await a.wait(550);
  for (let i = 1; i <= FILES.length; i++) {
    await a.set({ files: i });
    await a.wait(170);
  }
  await a.wait(250);
  await a.set({ post: true });
  await a.wait(600);
  await a.set({ done: true });
  await a.move("rest");
  await a.wait(2600);

  // 4. Reset with a cause: clear the terminal, the card's button settles back
  await a.type("clear", "clear", { interval: 60 });
  await a.key("enter");
  await a.set({ ...initial });
  await a.wait(600);
}

function HubCard({ copied }: { copied: boolean }) {
  return (
    <div className="cd-card">
      <div className="cd-card__head">
        <img src={logo} alt="" width={16} height={16} />
        <span className="cd-card__hub">BP Hub</span>
      </div>
      <div className="cd-card__title">
        <span className="cd-card__owner">{OWNER}</span>
        <span className="cd-card__slash">/</span>
        <span className="cd-card__name">{NAME}</span>
      </div>
      <div className="cd-card__tags">
        <span className="cd-tag" data-lang="go">
          <svg viewBox="0 0 24 24" width={12} height={12} fill={`#${siGo.hex}`} aria-hidden>
            <path d={siGo.path} />
          </svg>
          go
        </span>
        <Bar w={44} h={16} r={8} tone={1} />
        <Bar w={36} h={16} r={8} tone={1} />
      </div>
      <div className="cd-card__cmd">
        <code>bp clone {OWNER}/{NAME}</code>
        <Button
          data-target="copy"
          size="small"
          variant={copied ? "secondary" : "primary"}
          className="cd-copy"
          icon={
            <States
              value={copied ? "check" : "copy"}
              states={{ copy: <Copy size={12} />, check: <Check size={12} /> }}
            />
          }
        >
          <States value={copied ? "check" : "copy"} states={{ copy: "Copy", check: "Copied" }} />
        </Button>
      </div>
    </div>
  );
}

export default function CloneDemo() {
  return (
    <Stage
      width={640}
      height={490}
      compact={{ below: 600, width: 358, height: 470 }}
      initial={initial}
      poster={POSTER}
      script={script}
      cursor={{ at: { wide: { x: 470, y: 420 }, compact: { x: 290, y: 300 } }, ripple: true }}
      keys="bottom-right"
      className="cd"
    >
      {(s, _rect, layout) => (
        <>
          <Window chrome="terminal" lights="grey" title={layout === "wide" ? "~/projects — zsh" : undefined} className="cd-term">
            <div className="ss-term cd-term__body" data-target="term" data-cursor="ibeam">
              <Prompt path="~/projects">
                {s.pasted}
                {!s.cloned && <Caret still={!!s.pasted} />}
              </Prompt>
              <Collapse open={s.cloned}>
                <div>
                  <span className="ok">✓</span> cloned {OWNER}/{NAME} <span className="dim">as</span> {ALIAS}
                </div>
              </Collapse>
              {s.cloned && (
                <Prompt path="~/projects">
                  {s.gen}
                  {!s.pre && <Caret still={s.gen.length > 0 && s.gen.length < GEN.length} />}
                </Prompt>
              )}
              <Collapse open={s.pre}>
                <div>
                  <span className="dim">pre </span> go mod init {ALIAS} <span className="ok">✓</span>
                </div>
              </Collapse>
              {FILES.map((file, i) => (
                <Collapse key={file} open={s.files > i}>
                  <div>
                    <span className="cd-add">+</span> {ALIAS}/{file}
                  </div>
                </Collapse>
              ))}
              <Collapse open={s.post}>
                <div>
                  <span className="dim">post</span> go mod tidy <span className="ok">✓</span>
                </div>
              </Collapse>
              <Collapse open={s.done}>
                <div className="cd-done">
                  Generated {ALIAS} <span className="dim">in 1.4s</span>
                </div>
              </Collapse>
              {s.done && (
                <Prompt path="~/projects">
                  {s.clear}
                  <Caret still={s.clear.length > 0} />
                </Prompt>
              )}
            </div>
          </Window>

          <HubCard copied={s.copied} />
          <span data-target="rest" className="cd-rest" />
        </>
      )}
    </Stage>
  );
}
