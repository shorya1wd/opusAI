'use client'

import { useState } from "react"
import { createProjectAction } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function CreateProjectModal(){

    const [isOpen,setIsOpen]=useState(false)
    const [isSubmitting,setIsSubmitting]=useState(false)

    async function handleSubmit(e:React.FormEvent<HTMLFormElement>){

        e.preventDefault()
        setIsSubmitting(true)

        const formData=new FormData(e.currentTarget)
        const result=await createProjectAction(formData)

        if(result?.error){
            alert(result.error)
        } else {
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }
return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Give your project a name and a brief description to get started.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" name="name" placeholder="e.g. Website Redesign" required />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}