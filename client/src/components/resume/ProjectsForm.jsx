/* eslint-disable react/prop-types */
"use client"

import { FolderGit2, Sparkles, Loader2, Undo2 } from "lucide-react"
import { Button } from "../ui/button"
import { SectionCard, Field, AreaField, TagInput, RepeatItem, EmptyState } from "./FormControls"

/**
 * @param items      resumeData.projects
 * @param onAdd      () => void
 * @param onRemove   (index) => void
 * @param onChange   (index, field, value) => void
 * @param onImprove  (index) => void — rewrites that project's description with AI
 * @param improving  index currently being improved, or null
 * @param onUndo     (index) => void
 * @param undoable   index whose description can be restored, or null
 */
const ProjectsForm = ({
  items, onAdd, onRemove, onChange, onImprove, improving, onUndo, undoable,
}) => (
  <SectionCard
    icon={FolderGit2}
    title="Projects"
    subtitle="Show what you have built"
    onAdd={onAdd}
    addLabel="Add"
  >
    <div className="space-y-4">
      {items.length === 0 && <EmptyState text="No projects added yet." />}
      {items.map((project, index) => (
        <RepeatItem key={index} index={index} label="Project" onRemove={() => onRemove(index)}>
          <Field
            label="Project Name"
            value={project.name}
            onChange={(v) => onChange(index, "name", v)}
            placeholder="e.g. Job Portal"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="GitHub Repository"
              value={project.github}
              onChange={(v) => onChange(index, "github", v)}
              placeholder="github.com/you/job-portal"
            />
            <Field
              label="Live Link"
              value={project.link}
              onChange={(v) => onChange(index, "link", v)}
              placeholder="job-portal.vercel.app"
            />
          </div>
          <TagInput
            label="Technologies"
            values={project.technologies}
            onChange={(v) => onChange(index, "technologies", v)}
            placeholder="Type a technology and press Enter"
          />
          <AreaField
            label="Description"
            value={project.description}
            onChange={(v) => onChange(index, "description", v)}
            placeholder="Describe it however you like — e.g. I made a job portal using MERN stack"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => onImprove(index)}
              disabled={improving !== null}
              className="gradient-purple hover:opacity-90 text-white rounded-xl h-9 px-3 text-xs font-semibold shadow-lg shadow-violet-900/30"
            >
              {improving === index ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Improving…</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Improve with AI</>
              )}
            </Button>

            {undoable === index && improving === null && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onUndo(index)}
                className="border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-xl h-9 px-3 text-xs"
              >
                <Undo2 className="h-3 w-3 mr-1.5" /> Undo
              </Button>
            )}

            <span className="text-[11px] text-slate-600">
              Turns your notes into bullet points — no invented numbers.
            </span>
          </div>
        </RepeatItem>
      ))}
    </div>
  </SectionCard>
)

export default ProjectsForm
