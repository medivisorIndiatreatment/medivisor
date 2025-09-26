import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"

interface SearchHeroProps {
  searchQuery: string
  locationQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function SearchHero({ searchQuery, locationQuery, onSearchChange, onLocationChange }: SearchHeroProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Find Your Medical Advisor</h1>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Search for doctors, hospitals, or treatments to get the best healthcare experience
        </p>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-2">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search doctors, hospitals, or treatments..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pl-10 h-12 border-0 focus:ring-0 text-gray-900"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Enter location..."
                value={locationQuery}
                onChange={onLocationChange}
                className="w-full pl-10 h-12 border-0 focus:ring-0 text-gray-900"
              />
            </div>
            <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700">
              <Search size={20} className="mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}