"use client"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setSearchedQuery } from "@/redux/jobSlice"
import { Code, Database, Layers, PenTool, Laptop, Server, Cpu, BarChart2 } from "lucide-react"

const categories = [
  { name: "Frontend Dev", icon: Laptop },
  { name: "Backend Dev", icon: Server },
  { name: "Data Science", icon: BarChart2 },
  { name: "UI/UX Design", icon: PenTool },
  { name: "Full Stack", icon: Code },
  { name: "DevOps", icon: Cpu },
  { name: "ML / AI", icon: Layers },
  { name: "Database", icon: Database },
]

const CategoryCarousel = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query))
    navigate("/jobs")
  }

  return (
    <section className="bg-white py-20 border-t border-slate-200">

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Browse by Role</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Popular <span className="gradient-text">Categories</span>
          </h2>
          <p className="text-slate-600 mt-3 text-sm">Tap any category to see matching opportunities</p>
        </div>

        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent className="-ml-3 py-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <CarouselItem key={cat.name} className="pl-3 basis-1/3 md:basis-1/5 lg:basis-1/5">
                  <button
                    onClick={() => searchJobHandler(cat.name)}
                    className="w-full h-28 rounded-2xl border border-slate-200 bg-white shadow-sm card-hover group flex flex-col items-center justify-center gap-2.5"
                  >
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                      {cat.name}
                    </span>
                  </button>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious className="bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 -left-4" />
          <CarouselNext className="bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 -right-4" />
        </Carousel>
      </div>
    </section>
  )
}

export default CategoryCarousel
