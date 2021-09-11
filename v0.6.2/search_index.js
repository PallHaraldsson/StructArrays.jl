var documenterSearchIndex = {"docs":
[{"location":"examples/#Example-usage-to-store-complex-numbers","page":"Example usage","title":"Example usage to store complex numbers","text":"","category":"section"},{"location":"examples/","page":"Example usage","title":"Example usage","text":"julia> using StructArrays, Random\n\njulia> Random.seed!(4);\n\njulia> s = StructArray{ComplexF64}((rand(2,2), rand(2,2)))\n2×2 StructArray(::Array{Float64,2}, ::Array{Float64,2}) with eltype Complex{Float64}:\n 0.680079+0.625239im   0.92407+0.267358im\n 0.874437+0.737254im  0.929336+0.804478im\n\njulia> s[1, 1]\n0.680079235935741 + 0.6252391193298537im\n\njulia> s.re\n2×2 Array{Float64,2}:\n 0.680079  0.92407\n 0.874437  0.929336\n\njulia> StructArrays.components(s) # obtain all field arrays as a named tuple\n(re = [0.680079 0.92407; 0.874437 0.929336], im = [0.625239 0.267358; 0.737254 0.804478])","category":"page"},{"location":"examples/","page":"Example usage","title":"Example usage","text":"Note that the same approach can be used directly from an Array of complex numbers:","category":"page"},{"location":"examples/","page":"Example usage","title":"Example usage","text":"julia> StructArray([1+im, 3-2im])\n2-element StructArray(::Array{Int64,1}, ::Array{Int64,1}) with eltype Complex{Int64}:\n 1 + 1im\n 3 - 2im","category":"page"},{"location":"examples/#Example-usage-to-store-a-data-table","page":"Example usage","title":"Example usage to store a data table","text":"","category":"section"},{"location":"examples/","page":"Example usage","title":"Example usage","text":"julia> t = StructArray((a = [1, 2], b = [\"x\", \"y\"]))\n2-element StructArray(::Array{Int64,1}, ::Array{String,1}) with eltype NamedTuple{(:a, :b),Tuple{Int64,String}}:\n (a = 1, b = \"x\")\n (a = 2, b = \"y\")\n\njulia> t[1]\n(a = 1, b = \"x\")\n\njulia> t.a\n2-element Array{Int64,1}:\n 1\n 2\n\njulia> push!(t, (a = 3, b = \"z\"))\n3-element StructArray(::Array{Int64,1}, ::Array{String,1}) with eltype NamedTuple{(:a, :b),Tuple{Int64,String}}:\n (a = 1, b = \"x\")\n (a = 2, b = \"y\")\n (a = 3, b = \"z\")","category":"page"},{"location":"examples/#Example-usage-with-StaticArray-elements","page":"Example usage","title":"Example usage with StaticArray elements","text":"","category":"section"},{"location":"examples/","page":"Example usage","title":"Example usage","text":"julia> using StructArrays, StaticArrays\n\njulia> x = StructArray([SVector{2}(1,2) for i = 1:5])\n5-element StructArray(::Vector{Tuple{Int64, Int64}}) with eltype SVector{2, Int64}:\n [1, 2]\n [1, 2]\n [1, 2]\n [1, 2]\n [1, 2]\n\njulia> A = StructArray([SMatrix{2,2}([1 2;3 4]) for i = 1:5])\n5-element StructArray(::Vector{NTuple{4, Int64}}) with eltype SMatrix{2, 2, Int64, 4}:\n [1 2; 3 4]\n [1 2; 3 4]\n [1 2; 3 4]\n [1 2; 3 4]\n [1 2; 3 4]\n\njulia> B = StructArray([SArray{Tuple{2,2,2}}(reshape(1:8,2,2,2)) for i = 1:5]); B[1]\n2×2×2 SArray{Tuple{2, 2, 2}, Int64, 3, 8} with indices SOneTo(2)×SOneTo(2)×SOneTo(2):\n[:, :, 1] =\n 1  3\n 2  4\n\n[:, :, 2] =\n 5  7\n 6  8","category":"page"},{"location":"advanced/#Advanced-techniques","page":"Advanced techniques","title":"Advanced techniques","text":"","category":"section"},{"location":"advanced/#Structures-with-non-standard-data-layout","page":"Advanced techniques","title":"Structures with non-standard data layout","text":"","category":"section"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"StructArrays support structures with custom data layout. The user is required to overload staticschema in order to define the custom layout, component to access fields of the custom layout, and createinstance(T, fields...) to create an instance of type T from its custom fields fields. In other word, given x::T, createinstance(T, (component(x, f) for f in fieldnames(staticschema(T)))...) should successfully return an instance of type T.","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"Here is an example of a type MyType that has as custom fields either its field data or fields of its field rest (which is a named tuple):","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"using StructArrays\n\nstruct MyType{T, NT<:NamedTuple}\n    data::T\n    rest::NT\nend\n\nMyType(x; kwargs...) = MyType(x, values(kwargs))\n\nfunction StructArrays.staticschema(::Type{MyType{T, NamedTuple{names, types}}}) where {T, names, types}\n    return NamedTuple{(:data, names...), Base.tuple_type_cons(T, types)}\nend\n\nfunction StructArrays.component(m::MyType, key::Symbol)\n    return key === :data ? getfield(m, 1) : getfield(getfield(m, 2), key)\nend\n\n# generate an instance of MyType type\nfunction StructArrays.createinstance(::Type{MyType{T, NT}}, x, args...) where {T, NT}\n    return MyType(x, NT(args))\nend\n\ns = [MyType(rand(), a=1, b=2) for i in 1:10]\nStructArray(s)","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"In the above example, our MyType was composed of data of type Float64 and rest of type NamedTuple. In many practical cases where there are custom types involved it's hard for StructArrays to automatically widen the types in case they are heterogeneous. The following example demonstrates a widening method in that scenario.","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"using Tables\n\n# add a source of custom type data\nstruct Location{U}\n    x::U\n    y::U\nend\nstruct Region{V}\n    area::V\nend\n\ns1 = MyType(Location(1, 0), place = \"Delhi\", rainfall = 200)\ns2 = MyType(Location(2.5, 1.9), place = \"Mumbai\", rainfall = 1010)\ns3 = MyType(Region([Location(1, 0), Location(2.5, 1.9)]), place = \"North India\", rainfall = missing)\n\ns = [s1, s2, s3]\n# Now if we try to do StructArray(s)\n# we will get an error\n\nfunction meta_table(iter)\n    cols = Tables.columntable(iter)\n    meta_table(first(cols), Base.tail(cols)) \nend\n\nfunction meta_table(data, rest::NT) where NT<:NamedTuple\n    F = MyType{eltype(data), StructArrays.eltypes(NT)}\n    return StructArray{F}(; data=data, rest...)\nend\n\nmeta_table(s)","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"The above strategy has been tested and implemented in GeometryBasics.jl.","category":"page"},{"location":"advanced/#Mutate-or-widen-style-accumulation","page":"Advanced techniques","title":"Mutate-or-widen style accumulation","text":"","category":"section"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"StructArrays provides a function StructArrays.append!!(dest, src) (unexported) for \"mutate-or-widen\" style accumulation.  This function can be used via BangBang.append!! and BangBang.push!! as well.","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"StructArrays.append!! works like append!(dest, src) if dest can contain all element types in src iterator; i.e., it mutates dest in-place:","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"julia> dest = StructVector((a=[1], b=[2]))\n1-element StructArray(::Array{Int64,1}, ::Array{Int64,1}) with eltype NamedTuple{(:a, :b),Tuple{Int64,Int64}}:\n (a = 1, b = 2)\n\njulia> StructArrays.append!!(dest, [(a = 3, b = 4)])\n2-element StructArray(::Array{Int64,1}, ::Array{Int64,1}) with eltype NamedTuple{(:a, :b),Tuple{Int64,Int64}}:\n (a = 1, b = 2)\n (a = 3, b = 4)\n\njulia> ans === dest\ntrue","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"Unlike append!, append!! can also widen element type of dest array:","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"julia> StructArrays.append!!(dest, [(a = missing, b = 6)])\n3-element StructArray(::Array{Union{Missing, Int64},1}, ::Array{Int64,1}) with eltype NamedTuple{(:a, :b),Tuple{Union{Missing, Int64},Int64}}:\n NamedTuple{(:a, :b),Tuple{Union{Missing, Int64},Int64}}((1, 2))\n NamedTuple{(:a, :b),Tuple{Union{Missing, Int64},Int64}}((3, 4))\n NamedTuple{(:a, :b),Tuple{Union{Missing, Int64},Int64}}((missing, 6))\n\njulia> ans === dest\nfalse","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"Since the original array dest cannot hold the input, a new array is created (ans !== dest).","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"Combined with function barriers, append!! is a useful building block for implementing collect-like functions.","category":"page"},{"location":"advanced/#Using-StructArrays-in-CUDA-kernels","page":"Advanced techniques","title":"Using StructArrays in CUDA kernels","text":"","category":"section"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"It is possible to combine StructArrays with CUDAnative, in order to create CUDA kernels that work on StructArrays directly on the GPU. Make sure you are familiar with the CUDAnative documentation (esp. kernels with plain CuArrays) before experimenting with kernels based on StructArrays.","category":"page"},{"location":"advanced/","page":"Advanced techniques","title":"Advanced techniques","text":"using CUDAnative, CuArrays, StructArrays\nd = StructArray(a = rand(100), b = rand(100))\n\n# move to GPU\ndd = replace_storage(CuArray, d)\nde = similar(dd)\n\n# a simple kernel, to copy the content of `dd` onto `de`\nfunction kernel!(dest, src)\n    i = (blockIdx().x-1)*blockDim().x + threadIdx().x\n    if i <= length(dest)\n        dest[i] = src[i]\n    end\n    return nothing\nend\n\nthreads = 1024\nblocks = cld(length(dd),threads)\n\n@cuda threads=threads blocks=blocks kernel!(de, dd)","category":"page"},{"location":"counterintuitive/#Some-counterintuitive-behaviors","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"","category":"section"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"StructArrays doesn't explicitly store any structs; rather, it materializes a struct element on the fly when getindex is called. This is typically very efficient; for example, if all the struct fields are isbits, then materializing a new struct does not allocate. However, this can lead to counterintuitive behavior when modifying entries of a StructArray. ","category":"page"},{"location":"counterintuitive/#Modifying-the-field-of-a-struct-element","page":"Some counterintuitive behaviors","title":"Modifying the field of a struct element","text":"","category":"section"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"julia> mutable struct Foo{T}\n       a::T\n       b::T\n       end\n       \njulia> x = StructArray([Foo(1,2) for i = 1:5])\n\njulia> x[1].a = 10\n\njulia> x # remains unchanged\n5-element StructArray(::Vector{Int64}, ::Vector{Int64}) with eltype Foo{Int64}:\n Foo{Int64}(1, 2)\n Foo{Int64}(1, 2)\n Foo{Int64}(1, 2)\n Foo{Int64}(1, 2)\n Foo{Int64}(1, 2)","category":"page"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"The assignment x[1].a = 10 first calls getindex(x,1), then sets property a of the accessed element. However, since StructArrays constructs Foo(x.a[1],x.b[1]) on the fly when when accessing x[1], setting x[1].a = 10 modifies the materialized struct rather than the StructArray x. ","category":"page"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"Note that one can modify a field of a StructArray entry via x.a[1] = 10 (the order of . syntax and indexing syntax matters). As an added benefit, this does not require that the struct Foo is mutable, as it modifies the underlying component array x.a directly.","category":"page"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"For mutable structs, it is possible to write code that works for both regular Arrays and StructArrays with the following trick:","category":"page"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"x[1] = x[1].a = 10","category":"page"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"x[1].a = 10 creates a new Foo element, modifies the field a, then returns the modified struct. Assigning this to x[1] then unpacks a and b from the modified struct and assigns entries of the component arrays x.a[1] = a, x.b[1] = b.","category":"page"},{"location":"counterintuitive/#Broadcasted-assignment-for-array-entries","page":"Some counterintuitive behaviors","title":"Broadcasted assignment for array entries","text":"","category":"section"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"Broadcasted in-place assignment can also behave counterintuitively for StructArrays. ","category":"page"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"julia> mutable struct Bar{T} <: FieldVector{2,T}\n       a::T\n       b::T\n       end\n\njulia> x = StructArray([Bar(1,2) for i = 1:5])\n5-element StructArray(::Vector{Int64}, ::Vector{Int64}) with eltype Bar{Int64}:\n [1, 2]\n [1, 2]\n [1, 2]\n [1, 2]\n [1, 2]\n\njulia> x[1] .= 1\n2-element Bar{Int64} with indices SOneTo(2):\n 1\n 1\n\njulia> x\n5-element StructArray(::Vector{Int64}, ::Vector{Int64}) with eltype Bar{Int64}:\n [1, 2]\n [1, 2]\n [1, 2]\n [1, 2]\n [1, 2]       ","category":"page"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"Because setting x[1] .= 1 creates a Bar struct first, broadcasted assignment modifies this new materialized struct rather than the StructArray x. Note, however, that x[1] = x[1] .= 1 works, since it assigns the modified materialized struct to the first entry of x.","category":"page"},{"location":"counterintuitive/#Mutable-struct-types","page":"Some counterintuitive behaviors","title":"Mutable struct types","text":"","category":"section"},{"location":"counterintuitive/","page":"Some counterintuitive behaviors","title":"Some counterintuitive behaviors","text":"Each of these counterintuitive behaviors occur when using StructArrays with mutable elements. However, since the component arrays of a StructArray are generally mutable even if its entries are immutable, a StructArray with immutable elements will in many cases behave identically to (but be more efficient than) a StructArray with mutable elements. Thus, it is recommended to use immutable structs with StructArray whenever possible. ","category":"page"},{"location":"reference/#StructArrays.jl","page":"Index","title":"StructArrays.jl","text":"","category":"section"},{"location":"reference/","page":"Index","title":"Index","text":"CurrentModule = StructArrays","category":"page"},{"location":"reference/#Type","page":"Index","title":"Type","text":"","category":"section"},{"location":"reference/","page":"Index","title":"Index","text":"StructArray","category":"page"},{"location":"reference/#StructArrays.StructArray","page":"Index","title":"StructArrays.StructArray","text":"StructArray{T,N,C,I} <: AbstractArray{T, N}\n\nA type that stores an N-dimensional array of structures of type T as a structure of arrays.\n\ngetindex and setindex! are overloaded to get/set values of type T.\ngetproperty is overloaded to return individual field arrays.\n\nFields\n\ncomponents: a NamedTuple or Tuple of the arrays used by each field. These can be accessed by components(x).\n\n\n\n\n\n","category":"type"},{"location":"reference/#Constructors","page":"Index","title":"Constructors","text":"","category":"section"},{"location":"reference/","page":"Index","title":"Index","text":"StructArray(tup::Union{Tuple,NamedTuple})\nStructArray(::AbstractArray)\nStructArray(::Base.UndefInitializer, sz::Dims)\nStructArray(v)\ncollect_structarray","category":"page"},{"location":"reference/#StructArrays.StructArray-Tuple{Union{Tuple, NamedTuple}}","page":"Index","title":"StructArrays.StructArray","text":"StructArray{T}((components...)::Union{Tuple, NamedTuple})\nStructArray{T}(name1=component1, name2=component2, ...)\n\nConstruct a StructArray of element type T from the specified field arrays.\n\nStructArray((components...)::Union{Tuple, NamedTuple})\nStructArray(name1=component1, name2=component2, ...)\n\nConstruct a StructArray with a Tuple or NamedTuple element type from the specified field arrays.\n\nExamples\n\njulia> StructArray{ComplexF64}(([1.0, 2.0], [3.0, 4.0]))\n2-element StructArray(::Array{Float64,1}, ::Array{Float64,1}) with eltype Complex{Float64}:\n 1.0 + 3.0im\n 2.0 + 4.0im\n\njulia> StructArray{ComplexF64}(re=[1.0, 2.0], im=[3.0, 4.0])\n2-element StructArray(::Array{Float64,1}, ::Array{Float64,1}) with eltype Complex{Float64}:\n 1.0 + 3.0im\n 2.0 + 4.0im\n\nAny AbstractArray can be used as a field array\n\njulia> StructArray{Complex{Int64}}(([1, 2], 3:4))\n2-element StructArray(::Array{Int64,1}, ::UnitRange{Int64}) with eltype Complex{Int64}:\n 1 + 3im\n 2 + 4im\n\nIf no element type T is provided, a Tuple or NamedTuple is used:\n\njulia> StructArray((zeros(2,2), ones(2,2)))\n2×2 StructArray(::Array{Float64,2}, ::Array{Float64,2}) with eltype Tuple{Float64,Float64}:\n (0.0, 1.0)  (0.0, 1.0)\n (0.0, 1.0)  (0.0, 1.0)\n\njulia> StructArray(a=zeros(2,2), b=ones(2,2))\n2×2 StructArray(::Array{Float64,2}, ::Array{Float64,2}) with eltype NamedTuple{(:a, :b),Tuple{Float64,Float64}}:\n (a = 0.0, b = 1.0)  (a = 0.0, b = 1.0)\n (a = 0.0, b = 1.0)  (a = 0.0, b = 1.0)\n\n\n\n\n\n","category":"method"},{"location":"reference/#StructArrays.StructArray-Tuple{AbstractArray}","page":"Index","title":"StructArrays.StructArray","text":"StructArray{T}(A::AbstractArray; dims, unwrap=FT->FT!=eltype(A))\n\nConstruct a StructArray from slices of A along dims.\n\nThe unwrap keyword argument is a function that determines whether to recursively convert fields of type FT to StructArrays.\n\ncompat: Julia 1.1\nThis function requires at least Julia 1.1.\n\njulia> X = [1.0 2.0; 3.0 4.0]\n2×2 Array{Float64,2}:\n 1.0  2.0\n 3.0  4.0\n\njulia> StructArray{Complex{Float64}}(X; dims=1)\n2-element StructArray(view(::Array{Float64,2}, 1, :), view(::Array{Float64,2}, 2, :)) with eltype Complex{Float64}:\n 1.0 + 3.0im\n 2.0 + 4.0im\n\njulia> StructArray{Complex{Float64}}(X; dims=2)\n2-element StructArray(view(::Array{Float64,2}, :, 1), view(::Array{Float64,2}, :, 2)) with eltype Complex{Float64}:\n 1.0 + 2.0im\n 3.0 + 4.0im\n\nBy default, fields will be unwrapped until they match the element type of the array:\n\njulia> StructArray{Tuple{Float64,Complex{Float64}}}(rand(3,2); dims=1)\n2-element StructArray(view(::Array{Float64,2}, 1, :), StructArray(view(::Array{Float64,2}, 2, :), view(::Array{Float64,2}, 3, :))) with eltype Tuple{Float64,Complex{Float64}}:\n (0.004767505234193781, 0.27949621887414566 + 0.9039320635041561im)\n (0.41853472213051335, 0.5760165160827859 + 0.9782723869433818im)\n\n\n\n\n\n","category":"method"},{"location":"reference/#StructArrays.StructArray-Tuple{UndefInitializer, Tuple{Vararg{Int64, N}} where N}","page":"Index","title":"StructArrays.StructArray","text":"StructArray{T}(undef, dims; unwrap=T->false)\n\nConstruct an uninitialized StructArray with element type T, with Array field arrays.\n\nThe unwrap keyword argument is a function that determines whether to recursively convert arrays of element type T to StructArrays.\n\nExamples\n\njulia> StructArray{ComplexF64}(undef, (2,3))\n2×3 StructArray(::Array{Float64,2}, ::Array{Float64,2}) with eltype Complex{Float64}:\n  2.3166e-314+2.38405e-314im  2.39849e-314+2.38405e-314im  2.41529e-314+2.38405e-314im\n 2.31596e-314+2.41529e-314im  2.31596e-314+2.41529e-314im  2.31596e-314+NaN*im\n\n\n\n\n\n","category":"method"},{"location":"reference/#StructArrays.StructArray-Tuple{Any}","page":"Index","title":"StructArrays.StructArray","text":"StructArray(A; unwrap = T->false)\n\nConstruct a StructArray from an existing multidimensional array or iterator A.\n\nThe unwrap keyword argument is a function that determines whether to recursively convert arrays of element type T to StructArrays.\n\nExamples\n\nBasic usage\n\njulia> A = rand(ComplexF32, 2,2)\n2×2 Array{Complex{Float32},2}:\n 0.694399+0.94999im  0.422804+0.891131im\n 0.101001+0.33644im  0.632468+0.811319im\n\njulia> StructArray(A)\n2×2 StructArray(::Array{Float32,2}, ::Array{Float32,2}) with eltype Complex{Float32}:\n 0.694399+0.94999im  0.422804+0.891131im\n 0.101001+0.33644im  0.632468+0.811319im\n\nFrom an iterator\n\njulia> StructArray((1, Complex(i, j)) for i = 1:3, j = 2:4)\n3×3 StructArray(::Array{Int64,2}, ::Array{Complex{Int64},2}) with eltype Tuple{Int64,Complex{Int64}}:\n (1, 1+2im)  (1, 1+3im)  (1, 1+4im)\n (1, 2+2im)  (1, 2+3im)  (1, 2+4im)\n (1, 3+2im)  (1, 3+3im)  (1, 3+4im)\n\nRecursive unwrapping\n\njulia> StructArray((1, Complex(i, j)) for i = 1:3, j = 2:4; unwrap = T -> !(T<:Real))\n3×3 StructArray(::Array{Int64,2}, StructArray(::Array{Int64,2}, ::Array{Int64,2})) with eltype Tuple{Int64,Complex{Int64}}:\n (1, 1+2im)  (1, 1+3im)  (1, 1+4im)\n (1, 2+2im)  (1, 2+3im)  (1, 2+4im)\n (1, 3+2im)  (1, 3+3im)  (1, 3+4im)\n\n\n\n\n\n","category":"method"},{"location":"reference/#StructArrays.collect_structarray","page":"Index","title":"StructArrays.collect_structarray","text":"collect_structarray(itr; initializer = default_initializer)\n\nCollects itr into a StructArray. The user can optionally pass a initializer, that is to say a function (S, d) -> v that associates to a type and a size an array of eltype S and size d. By default initializer returns a StructArray of Array but custom array types may be used.\n\n\n\n\n\n","category":"function"},{"location":"reference/#Accessors","page":"Index","title":"Accessors","text":"","category":"section"},{"location":"reference/","page":"Index","title":"Index","text":"StructArrays.components","category":"page"},{"location":"reference/#StructArrays.components","page":"Index","title":"StructArrays.components","text":"components(s::StructArray)\n\nReturn the field arrays corresponding to the various entry of the struct as a NamedTuple, or a Tuple if the struct has no names.\n\nExamples\n\njulia> s = StructArray(rand(ComplexF64, 4));\n\njulia> components(s)\n(re = [0.396526, 0.486036, 0.459595, 0.0323561], im = [0.147702, 0.81043, 0.00993469, 0.487091])\n\n\n\n\n\n","category":"function"},{"location":"reference/#Lazy-iteration","page":"Index","title":"Lazy iteration","text":"","category":"section"},{"location":"reference/","page":"Index","title":"Index","text":"LazyRow\nLazyRows","category":"page"},{"location":"reference/#StructArrays.LazyRow","page":"Index","title":"StructArrays.LazyRow","text":"LazyRow(s::StructArray, i)\n\nA lazy representation of s[i]. LazyRow(s, i) does not materialize the ith row but returns a lazy wrapper around it on which getproperty does the correct thing. This is useful when the row has many fields only some of which are necessary. It also allows changing columns in place.\n\nSee LazyRows to get an iterator of LazyRows.\n\nExamples\n\njulia> t = StructArray((a = [1, 2], b = [\"x\", \"y\"]));\n\njulia> LazyRow(t, 2).a\n2\n\njulia> LazyRow(t, 2).a = 123\n123\n\njulia> t\n2-element StructArray(::Array{Int64,1}, ::Array{String,1}) with eltype NamedTuple{(:a, :b),Tuple{Int64,String}}:\n (a = 1, b = \"x\")\n (a = 123, b = \"y\")\n\n\n\n\n\n","category":"type"},{"location":"reference/#StructArrays.LazyRows","page":"Index","title":"StructArrays.LazyRows","text":"LazyRows(s::StructArray)\n\nAn iterator of LazyRows of s.\n\nExamples\n\njulia> map(t -> t.b ^ t.a, LazyRows(t))\n2-element Array{String,1}:\n \"x\"\n \"yy\"\n\n\n\n\n\n","category":"type"},{"location":"reference/#Advanced-APIs","page":"Index","title":"Advanced APIs","text":"","category":"section"},{"location":"reference/","page":"Index","title":"Index","text":"StructArrays.append!!\nStructArrays.replace_storage","category":"page"},{"location":"reference/#StructArrays.append!!","page":"Index","title":"StructArrays.append!!","text":"dest = StructArrays.append!!(dest, itr)\n\nTry to append itr into a vector dest, widening the element type of dest if it cannot hold the elements of itr. That is to say,\n\nvcat(dest, StructVector(itr)) == append!!(dest, itr)\n\nholds. Note that the dest argument may or may not be the same object as the returned value.\n\nThe state of dest is unpredictable after append!! is called (e.g., it may contain some, none or all the elements from itr).\n\n\n\n\n\n","category":"function"},{"location":"reference/#StructArrays.replace_storage","page":"Index","title":"StructArrays.replace_storage","text":"StructArrays.replace_storage(f, s::StructArray)\n\nChange storage type for components: each array v is replaced by f(v). f(v) is expected to have the same eltype and size as v.\n\nExamples\n\nIf PooledArrays is loaded, we can pool all columns of non isbitstype:\n\njulia> using StructArrays, PooledArrays\n\njulia> s = StructArray(a=1:3, b = fill(\"string\", 3));\n\njulia> s_pooled = StructArrays.replace_storage(s) do v\n           isbitstype(eltype(v)) ? v : convert(PooledArray, v)\n       end\n3-element StructArray(::UnitRange{Int64}, ::PooledVector{String, UInt32, Vector{UInt32}}) with eltype NamedTuple{(:a, :b), Tuple{Int64, String}}:\n (a = 1, b = \"string\")\n (a = 2, b = \"string\")\n (a = 3, b = \"string\")\n\n\n\n\n\n","category":"function"},{"location":"reference/#Interface","page":"Index","title":"Interface","text":"","category":"section"},{"location":"reference/","page":"Index","title":"Index","text":"StructArrays.staticschema\nStructArrays.component\nStructArrays.createinstance","category":"page"},{"location":"reference/#StructArrays.staticschema","page":"Index","title":"StructArrays.staticschema","text":"StructArrays.staticschema(T)\n\nThe default schema for an element type T. A schema is a Tuple or NamedTuple type containing the necessary fields to construct T. By default, this will have fields with the same names and types as T.\n\nThis can be overloaded for custom types if required, in which case StructArrays.component and StructArrays.createinstance should also be defined.\n\njulia> StructArrays.staticschema(Complex{Float64})\nNamedTuple{(:re, :im),Tuple{Float64,Float64}}\n\n\n\n\n\nStructArrays.staticschema(::Type{<:StaticArray{S, T}}) where {S, T}\n\nThe staticschema of a StaticArray element type is the staticschema of the underlying Tuple.\n\njulia> StructArrays.staticschema(SVector{2, Float64})\nTuple{Float64, Float64}\n\nThe one exception to this rule is <:StaticArrays.FieldArray, since FieldArray is based on a  struct. In this case, staticschema(<:FieldArray) returns the staticschema for the struct  which subtypes FieldArray. \n\n\n\n\n\n","category":"function"},{"location":"reference/#StructArrays.component","page":"Index","title":"StructArrays.component","text":"StructArrays.component(x, i)\n\nDefault to getfield. It should be overloaded for custom types with a custom schema. See StructArrays.staticschema.\n\n\n\n\n\n","category":"function"},{"location":"reference/#StructArrays.createinstance","page":"Index","title":"StructArrays.createinstance","text":"StructArrays.createinstance(T, args...)\n\nConstruct an instance of type T from its backing representation. args here are the elements of the Tuple or NamedTuple type specified staticschema(T).\n\njulia> StructArrays.createinstance(Complex{Float64}, (re=1.0, im=2.0)...)\n1.0 + 2.0im\n\n\n\n\n\n","category":"function"},{"location":"reference/#Internals","page":"Index","title":"Internals","text":"","category":"section"},{"location":"reference/","page":"Index","title":"Index","text":"StructArrays.get_ith\nStructArrays.map_params\nStructArrays._map_params\nStructArrays.buildfromschema\nStructArrays.bypass_constructor\nStructArrays.iscompatible","category":"page"},{"location":"reference/#StructArrays.get_ith","page":"Index","title":"StructArrays.get_ith","text":"StructArrays.get_ith(cols::Union{Tuple,NamedTuple}, I...)\n\nForm a Tuple of the Ith index of each element of cols, i.e. is equivalent to\n\nmap(c -> c[I...], Tuple(cols))\n\n\n\n\n\n","category":"function"},{"location":"reference/#StructArrays.map_params","page":"Index","title":"StructArrays.map_params","text":"StructArrays.map_params(f, T)\n\nApply f to each field type of Tuple or NamedTuple type T, returning a new Tuple or NamedTuple type.\n\njulia> StructArrays.map_params(T -> Complex{T}, Tuple{Int32,Float64})\nTuple{Complex{Int32},Complex{Float64}}\n\n\n\n\n\n","category":"function"},{"location":"reference/#StructArrays._map_params","page":"Index","title":"StructArrays._map_params","text":"StructArrays._map_params(f, T)\n\nApply f to each field type of Tuple or NamedTuple type T, returning a new Tuple or NamedTuple object.\n\njulia> StructArrays._map_params(T -> Complex{T}, Tuple{Int32,Float64})\n(Complex{Int32}, Complex{Float64})\n\n\n\n\n\n","category":"function"},{"location":"reference/#StructArrays.buildfromschema","page":"Index","title":"StructArrays.buildfromschema","text":"StructArrays.buildfromschema(initializer, T[, S])\n\nConstruct a StructArray{T} with a function initializer, using a schema S.\n\ninitializer(T) is a function applied to each field type of S, and should return an AbstractArray{S}\n\nS is a Tuple or NamedTuple type. The default value is staticschema(T).\n\n\n\n\n\n","category":"function"},{"location":"reference/#StructArrays.bypass_constructor","page":"Index","title":"StructArrays.bypass_constructor","text":"StructArrays.bypass_constructor(T, args)\n\nCreate an instance of type T from a tuple of field values args, bypassing possible internal constructors. T should be a concrete type.\n\n\n\n\n\n","category":"function"},{"location":"reference/#StructArrays.iscompatible","page":"Index","title":"StructArrays.iscompatible","text":"StructArrays.iscompatible(::Type{S}, ::Type{V}) where {S, V<:AbstractArray}\n\nCheck whether element type S can be pushed to a container of type V.\n\n\n\n\n\n","category":"function"},{"location":"#Overview-of-StructArrays.jl","page":"Overview","title":"Overview of StructArrays.jl","text":"","category":"section"},{"location":"","page":"Overview","title":"Overview","text":"This package introduces the type StructArray which is an AbstractArray whose elements are struct (for example NamedTuples,  or ComplexF64, or a custom user defined struct). While a StructArray iterates structs, the layout is column based (meaning each field of the struct is stored in a separate Array, and struct entries of a StructArray are constructed on-the-fly). ","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"Base.getproperty or the dot syntax can be used to access columns, whereas rows can be accessed with getindex. ","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"The package was largely inspired by the Columns type in IndexedTables which it now replaces.","category":"page"},{"location":"#Collection-and-initialization","page":"Overview","title":"Collection and initialization","text":"","category":"section"},{"location":"","page":"Overview","title":"Overview","text":"One can create a StructArray by providing the struct type and a tuple or NamedTuple of field arrays:","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"julia> struct Foo{T}\n       a::T\n       b::T\n       end\n\njulia> x = StructArray{Foo}((rand(2,2), rand(2,2)))\n2×2 StructArray(::Matrix{Float64}, ::Matrix{Float64}) with eltype Foo:\n Foo{Float64}(0.702413, 0.416194)  Foo{Float64}(0.520032, 0.0856553)\n Foo{Float64}(0.701297, 0.977394)  Foo{Float64}(0.451654, 0.258264)\n\njulia> x = StructArray{Foo}((a=rand(2,2), b=rand(2,2)))\n2×2 StructArray(::Matrix{Float64}, ::Matrix{Float64}) with eltype Foo:\n Foo{Float64}(0.702413, 0.416194)  Foo{Float64}(0.520032, 0.0856553)\n Foo{Float64}(0.701297, 0.977394)  Foo{Float64}(0.451654, 0.258264) ","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"If a struct is not specified, a StructArray of Tuple or NamedTuple type will be created","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"julia> x = StructArray((rand(2,2), rand(2,2)))\n2×2 StructArray(::Matrix{Float64}, ::Matrix{Float64}) with eltype Tuple{Float64, Float64}:\n (0.754912, 0.803434)  (0.341105, 0.904933)\n (0.348966, 0.550496)  (0.199761, 0.511388)\n\njulia> x = StructArray((x = rand(2,2), y = rand(2,2)))\n2×2 StructArray(::Matrix{Float64}, ::Matrix{Float64}) with eltype NamedTuple{(:x, :y), Tuple{Float64, Float64}}:\n (x = 0.486, y = 0.00588886)   (x = 0.97401, y = 0.834173)\n (x = 0.394493, y = 0.192362)  (x = 0.107698, y = 0.694548)","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"One can also create a StructArray from an iterable of structs without creating an intermediate Array:","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"julia> StructArray(log(j+2.0*im) for j in 1:10)\n10-element StructArray(::Array{Float64,1}, ::Array{Float64,1}) with eltype Complex{Float64}:\n 0.8047189562170501 + 1.1071487177940904im\n 1.0397207708399179 + 0.7853981633974483im\n 1.2824746787307684 + 0.5880026035475675im\n 1.4978661367769954 + 0.4636476090008061im\n  1.683647914993237 + 0.3805063771123649im\n 1.8444397270569681 + 0.3217505543966422im\n  1.985145956776061 + 0.27829965900511133im\n 2.1097538525880535 + 0.24497866312686414im\n 2.2213256282451583 + 0.21866894587394195im\n 2.3221954495706862 + 0.19739555984988078im","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"Another option is to create an uninitialized StructArray and then fill it with data. Just like in normal arrays, this is done with the undef syntax:","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"julia> s = StructArray{ComplexF64}(undef, 2, 2)\n2×2 StructArray(::Array{Float64,2}, ::Array{Float64,2}) with eltype Complex{Float64}:\n 6.91646e-310+6.91646e-310im  6.91646e-310+6.91646e-310im\n 6.91646e-310+6.91646e-310im  6.91646e-310+6.91646e-310im\n\njulia> rand!(s)\n2×2 StructArray(::Array{Float64,2}, ::Array{Float64,2}) with eltype Complex{Float64}:\n 0.680079+0.874437im  0.625239+0.737254im\n  0.92407+0.929336im  0.267358+0.804478im","category":"page"},{"location":"#Using-custom-array-types","page":"Overview","title":"Using custom array types","text":"","category":"section"},{"location":"","page":"Overview","title":"Overview","text":"StructArrays supports using custom array types. It is always possible to pass field arrays of a custom type. The \"custom array of structs to struct of custom arrays\" transformation will use the similar method of the custom array type. This can be useful when working on the GPU for example:","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"julia> using StructArrays, CuArrays\n\njulia> a = CuArray(rand(Float32, 10));\n\njulia> b = CuArray(rand(Float32, 10));\n\njulia> StructArray{ComplexF32}((a, b))\n10-element StructArray(::CuArray{Float32,1}, ::CuArray{Float32,1}) with eltype Complex{Float32}:\n  0.19555175f0 + 0.9604322f0im\n  0.68348145f0 + 0.5778245f0im\n  0.69664395f0 + 0.79825306f0im\n 0.118531585f0 + 0.3031248f0im\n  0.80057466f0 + 0.8964418f0im\n  0.63772964f0 + 0.2923274f0im\n  0.65374136f0 + 0.7932533f0im\n   0.6043732f0 + 0.65964353f0im\n   0.1106627f0 + 0.090207934f0im\n    0.707458f0 + 0.1700114f0im\n\njulia> c = CuArray(rand(ComplexF32, 10));\n\njulia> StructArray(c)\n10-element StructArray(::Array{Float32,1}, ::Array{Float32,1}) with eltype Complex{Float32}:\n  0.7176411f0 + 0.864058f0im\n   0.252609f0 + 0.14824867f0im\n 0.26842773f0 + 0.9084332f0im\n 0.33128333f0 + 0.5106474f0im\n  0.6509278f0 + 0.87059164f0im\n  0.9522146f0 + 0.053706646f0im\n   0.899577f0 + 0.63242567f0im\n   0.325814f0 + 0.59225655f0im\n 0.56267905f0 + 0.21927536f0im\n 0.49719965f0 + 0.754143f0im","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"If you already have your data in a StructArray with field arrays of a given format (say plain Array) you can change them with replace_storage:","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"julia> s = StructArray([1.0+im, 2.0-im])\n2-element StructArray(::Array{Float64,1}, ::Array{Float64,1}) with eltype Complex{Float64}:\n 1.0 + 1.0im\n 2.0 - 1.0im\n\njulia> replace_storage(CuArray, s)\n2-element StructArray(::CuArray{Float64,1}, ::CuArray{Float64,1}) with eltype Complex{Float64}:\n 1.0 + 1.0im\n 2.0 - 1.0im","category":"page"},{"location":"#Lazy-row-iteration","page":"Overview","title":"Lazy row iteration","text":"","category":"section"},{"location":"","page":"Overview","title":"Overview","text":"StructArrays also provides a LazyRow wrapper for lazy row iteration. LazyRow(t, i) does not materialize the i-th row but returns a lazy wrapper around it on which getproperty does the correct thing. This is useful when the row has many fields only some of which are necessary. It also allows changing columns in place.","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"julia> t = StructArray((a = [1, 2], b = [\"x\", \"y\"]));\n\njulia> LazyRow(t, 2).a\n2\n\njulia> LazyRow(t, 2).a = 123\n123\n\njulia> t\n2-element StructArray(::Array{Int64,1}, ::Array{String,1}) with eltype NamedTuple{(:a, :b),Tuple{Int64,String}}:\n (a = 1, b = \"x\")\n (a = 123, b = \"y\")","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"To iterate in a lazy way one can simply iterate LazyRows:","category":"page"},{"location":"","page":"Overview","title":"Overview","text":"julia> map(t -> t.b ^ t.a, LazyRows(t))\n2-element Array{String,1}:\n \"x\"\n \"yy\"","category":"page"},{"location":"#Applying-a-function-on-each-field-array","page":"Overview","title":"Applying a function on each field array","text":"","category":"section"},{"location":"","page":"Overview","title":"Overview","text":"julia> struct Foo\n       a::Int\n       b::String\n       end\n\njulia> s = StructArray([Foo(11, \"a\"), Foo(22, \"b\"), Foo(33, \"c\"), Foo(44, \"d\"), Foo(55, \"e\")]);\n\njulia> s\n5-element StructArray(::Vector{Int64}, ::Vector{String}) with eltype Foo:\n Foo(11, \"a\")\n Foo(22, \"b\")\n Foo(33, \"c\")\n Foo(44, \"d\")\n Foo(55, \"e\")\n\njulia> StructArrays.foreachfield(v -> deleteat!(v, 3), s)\n\njulia> s\n4-element StructArray(::Vector{Int64}, ::Vector{String}) with eltype Foo:\n Foo(11, \"a\")\n Foo(22, \"b\")\n Foo(44, \"d\")\n Foo(55, \"e\")","category":"page"}]
}
