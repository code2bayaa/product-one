import { gql, useMutation, useLazyQuery } from '@apollo/client';

export const useGraphPerson = () => {

    const FETCH_PERSON_QUERY = gql`
        query FetchPerson (
            $page: Int!,
            $index : String!,
            $search:String!,
        ){
            fetchPerson(
                page:$page,
                search:$search,
                index:$index,
            ) {
                results {
                    adult
                    gender
                    profile_path
                    id
                    known_for_department
                    name
                    original_name
                    popularity

                }
                page
                total_pages
                total_results                
                success
                error
                message
            }
        }
    `
    const [fetchPerson,fetchedPersonData] = useLazyQuery(FETCH_PERSON_QUERY,{
        notifyOnNetworkStatusChange: true,
    });

    const INSERT_PERSON_MUTATION = gql`
        mutation searchPerson(
            $page:Int!,
            $results:[SEARCH_PERSON_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :SEARCH_PERSON_DATA_INPUT,
            $type:String!,
        ) {
            searchPerson(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                type:$type,
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertPerson] = useMutation(INSERT_PERSON_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.searchPerson.success) {
                if(data.searchPerson.message === "already inserted")
                    // console.log("person inserting already started...")
                fetchedPersonData.refetch()
                .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert person into MySQL:", data.searchPerson.message, data.searchPerson.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting person into MySQL:", error.message);
        },
    });

    return {
        fetchPerson,
        fetchedPersonData,
        mutateInsertPerson,
    }
}