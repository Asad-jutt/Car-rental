import type { StructureResolver } from 'sanity/structure'

/** Fleet-first desk: every car in one list, sorted the way the site sorts them. */
export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('Fleet')
    .items([
      S.listItem()
        .title('All cars')
        .id('allCars')
        .child(
          S.documentList()
            .title('All cars')
            .filter('_type == "car"')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
      S.divider(),
      S.listItem()
        .title('Bookable now')
        .id('available')
        .child(
          S.documentList()
            .title('Bookable now')
            .schemaType('car')
            .filter('_type == "car" && available == true')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
      S.listItem()
        .title('Featured')
        .id('featured')
        .child(
          S.documentList()
            .title('Featured')
            .schemaType('car')
            .filter('_type == "car" && featured == true'),
        ),
    ])
