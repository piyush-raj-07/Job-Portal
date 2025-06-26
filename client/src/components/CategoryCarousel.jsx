"use client"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import { Button } from "./ui/button"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setSearchedQuery } from "@/redux/jobSlice"
import { Code, Database, Layers, PenTool, Laptop } from "lucide-react"

const categories = [
  { name: "Frontend Developer", icon: <Laptop className="h-5 w-5" /> },
  { name: "Backend Developer", icon: <Database className="h-5 w-5" /> },
  { name: "Data Science", icon: <Layers className="h-5 w-5" /> },
  { name: "Graphic Designer", icon: <PenTool className="h-5 w-5" /> },
  { name: "FullStack Developer", icon: <Code className="h-5 w-5" /> },
]

const CategoryCarousel = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query))
    navigate("/browse")
  }

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Popular <span className="text-blue-500">Categories</span>
          </h2>
          <p className="text-gray-400">Explore opportunities in trending fields</p>
        </div>

        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {categories.map((cat, index) => (
              <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4 pl-4">
                <Button
                  onClick={() => searchJobHandler(cat.name)}
                  variant="outline"
                  className="w-full h-32 bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-blue-500/50 text-white rounded-xl transition-all group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-900/30 text-blue-500 group-hover:bg-blue-800/40 transition-all">
                      {cat.icon}
                    </div>
                    <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">{cat.name}</span>
                  </div>
                </Button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700" />
          <CarouselNext className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700" />
        </Carousel>
      </div>
    </div>
  )
}

export default CategoryCarousel
