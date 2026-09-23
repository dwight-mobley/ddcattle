import { useGetAnimalsQuery } from "../features/api/animalApi";
import { useMemo, useState } from "react";
import { AnimalCard } from "../components/AnimalCard";

const speciesLabels = {
    horse: "Horses",
    dog: "Dogs",
    cattle: "Cattle",
    other: "Other",
};

const statusLabels = {
    active: "Active",
    sold: "Sold",
    deceased: "Deceased",
    inactive: "Inactive",
    other: "Other",
};

const statusStyles = {
    active: "bg-sage/15 text-sage",
    sold: "bg-rust/10 text-rust",
    deceased: "bg-charcoal/10 text-charcoal",
    inactive: "bg-saddle-brown/10 text-saddle-brown",
    other: "bg-charcoal/10 text-charcoal",
};



function FilterButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${active
                    ? "bg-saddle-brown text-white"
                    : "bg-white text-charcoal/65 ring-1 ring-saddle-brown/10 hover:bg-saddle-brown/5 hover:text-saddle-brown"
                }`}
        >
            {children}
        </button>
    );
}

function EmptyState({ search, onClear }) {
    return (
        <div className="rounded-xl border border-dashed border-saddle-brown/20 bg-white/50 px-6 py-20 text-center">
            <p className="font-serif text-2xl text-saddle-brown">
                No animals found
            </p>

            <p className="mt-2 text-charcoal/55">
                {search
                    ? "Try a different name or color."
                    : "There are no animals matching these filters."}
            </p>

            <button
                onClick={onClear}
                className="mt-6 rounded-lg bg-saddle-brown px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rust"
            >
                Clear filters
            </button>
        </div>
    );
}

export default function TheBarn() {
    const { data: animals=[], isLoading, isError } = useGetAnimalsQuery();

    const [species, setSpecies] = useState("all");
    const [status, setStatus] = useState("active");
    const [search, setSearch] = useState("");

    const filteredAnimals = useMemo(() => {
        return animals.filter((animal) => {
            const matchesSpecies =
                species === "all" || animal.species === species;

            const matchesStatus =
                status === "all" || animal.status === status;

            const searchTerm = search.toLowerCase();

            const matchesSearch =
                animal.name.toLowerCase().includes(searchTerm) ||
                (animal.color || "").toLowerCase().includes(searchTerm);

            return matchesSpecies && matchesStatus && matchesSearch;
        });
    }, [animals, species, status, search]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (isError) {
        return <p>Error loading animals.</p>;
    }

    const species_options = Array.from(new Set(animals.map(animal => animal.species)));
    return (
        <main className="min-h-screen bg-desert-sand">          
            {/* Header */}
            <section className="border-b border-saddle-brown/10 bg-desert-sand">
                <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-rust">
                            The Ranch
                        </p>

                        <h1 className="font-serif text-5xl leading-tight text-saddle-brown md:text-6xl">
                            Our animals
                        </h1>

                        <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/65">
                            Meet the horses, cattle, dogs, and other animals that
                            call the ranch home.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mt-10 max-w-xl">
                        <label htmlFor="animal-search" className="sr-only">
                            Search animals
                        </label>

                        <div className="relative">
                            <input
                                id="animal-search"
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or color..."
                                className="w-full rounded-xl border border-saddle-brown/15 bg-white px-5 py-4 text-charcoal outline-none transition placeholder:text-charcoal/35 focus:border-rust focus:ring-2 focus:ring-rust/10"
                            />

                            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-saddle-brown/40">
                                ⌕
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Animals */}
            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                <div className="mb-8 flex flex-col gap-5 border-b border-saddle-brown/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Species filters */}
                    <div className="flex flex-wrap gap-2">
                        <FilterButton
                            active={species === "all"}
                            onClick={() => setSpecies("all")}
                        >
                            All animals
                        </FilterButton>

                        {species_options.map((value) => (
                            <FilterButton
                                key={value}
                                active={species === value}
                                onClick={() => setSpecies(value)}
                            >
                                {value}
                            </FilterButton>
                        ))}
                    </div>

                  
                </div>

                {/* Count */}
                <div className="mb-6 text-sm text-charcoal/50">
                    Showing{" "}
                    <span className="font-semibold text-charcoal">
                        {filteredAnimals.length}
                    </span>{" "}
                    {filteredAnimals.length === 1 ? "animal" : "animals"}
                </div>

                {/* Grid */}
                {filteredAnimals.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredAnimals.map((animal) => (
                            <AnimalCard key={animal.id} animal={animal} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        search={search}
                        onClear={() => {
                            setSearch("");
                            setSpecies("all");
                            setStatus("all");
                        }}
                    />
                )}
            </section>
        </main>
    );
}
