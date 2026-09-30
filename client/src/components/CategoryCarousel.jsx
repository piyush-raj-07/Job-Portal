"use client"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setSearchedQuery } from "@/redux/jobSlice"
import { Code, Database, Layers, PenTool, Laptop, Server, Cpu, BarChart2 } from "lucide-react"

const categories = [
  { name: "Frontend Dev", icon: Laptop, color: "from-violet-600/20 to-purple-600/10", border: "border-violet-500/20", text: "text-violet-300" },
  { name: "Backend Dev", icon: Server, color: "from-indigo-600/20 to-blue-600/10", border: "border-indigo-500/20", text: "text-indigo-300" },
  { name: "Data Science", icon: BarChart2, color: "from-purple-600/20 to-pink-600/10", border: "border-purple-500/20", text: "text-purple-300" },
  { name: "UI/UX Design", icon: PenTool, color: "from-pink-600/20 to-rose-600/10", border: "border-pink-500/20", text: "text-pink-300" },
  { name: "Full Stack", icon: Code, color: "from-cyan-600/20 to-blue-600/10", border: "border-cyan-500/20", text: "text-cyan-300" },
  { name: "DevOps", icon: Cpu, color: "from-emerald-600/20 to-teal-600/10", border: "border-emerald-500/20", text: "text-emerald-300" },
  { name: "ML / AI", icon: Layers, color: "from-amber-600/20 to-orange-600/10", border: "border-amber-500/20", text: "text-amber-300" },
  { name: "Database", icon: Database, color: "from-blue-600/20 to-indigo-600/10", border: "border-blue-500/20", text: "text-blue-300" },
]

const CategoryCarousel = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query))
    navigate("/jobs")
  }

  return (
    <section className="bg-[#080d1a] py-20 border-t border-white/5">
      {/* Background glow */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[700px] h-64 bg-violet-900/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">Browse by Role</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Popular <span className="gradient-text">Categories</span>
          </h2>
          <p className="text-slate-500 mt-3 text-sm">Tap any category to see matching opportunities</p>
        </div>

        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent className="-ml-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <CarouselItem key={cat.name} className="pl-3 basis-1/3 md:basis-1/5 lg:basis-1/5">
                  <button
                    onClick={() => searchJobHandler(cat.name)}
                    className={`w-full h-28 rounded-2xl border ${cat.border} bg-gradient-to-br ${cat.color} 
                      hover:scale-[1.03] hover:shadow-lg transition-all duration-200 group flex flex-col items-center justify-center gap-2.5`}
                  >
                    <div className={`p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-all`}>
                      <Icon className={`h-5 w-5 ${cat.text}`} />
                    </div>
                    <span className={`text-sm font-semibold ${cat.text} group-hover:brightness-125 transition-all`}>
                      {cat.name}
                    </span>
                  </button>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious className="bg-white/5 border-white/10 text-white hover:bg-white/10 -left-4" />
          <CarouselNext className="bg-white/5 border-white/10 text-white hover:bg-white/10 -right-4" />
        </Carousel>
      </div>
    </section>
  )
}

export default CategoryCarousel
